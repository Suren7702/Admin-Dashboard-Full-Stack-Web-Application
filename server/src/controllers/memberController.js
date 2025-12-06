// server/src/controllers/memberController.js
import Member from "../models/Member.js";

// READ: GET /api/members
export const getMembers = async (req, res) => {
  try {
    const { search, team } = req.query;
    const query = {};

    if (team && team !== "all") {
      query.teamName = team; // or query.team if schema la 'team'
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");

      query.$or = [
        { name: regex },
        { team: regex },
        { teamName: regex },
        { phone: regex },
        { community: regex },
        { blood: regex },
        { bloodGroup: regex },
        { role: regex },
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    return res.json(members);
  } catch (err) {
    console.error("getMembers error:", err.message);
    res.status(500).json({ message: "Server error fetching members" });
  }
};

// CREATE: POST /api/members
export const createMember = async (req, res) => {
  try {
    const {
      team,
      teamName,
      name,
      role,
      phone,
      community,
      blood,
      bloodGroup,

      // 🆕 Maanadu fields
      maanaduEnabled,
      maanaduEventName,
      maanaduVehicleType,
      maanaduAmount,
      maanaduDate,
      maanaduNotes,
    } = req.body;

    if (!name || !phone || !(team || teamName)) {
      return res
        .status(400)
        .json({ message: "Team, Name, Phone are required" });
    }

    const member = await Member.create({
      team: team || teamName,
      teamName: teamName || team,
      name,
      role,
      phone,
      community,
      blood: blood || bloodGroup,
      bloodGroup: bloodGroup || blood,
      createdBy: req.user?._id,

      // 🆕 attach maanadu info (optional)
      maanaduSupport: {
        enabled: !!maanaduEnabled,
        eventName: maanaduEventName || "",
        vehicleType: maanaduVehicleType || "",
        amountSpent: maanaduAmount || 0,
        date: maanaduDate || null,
        notes: maanaduNotes || "",
      },
    });

    res.status(201).json(member);
  } catch (err) {
    console.error("createMember error:", err.message);
    res.status(500).json({ message: "Server error creating member" });
  }
};

// UPDATE: PUT /api/members/:id
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      team,
      teamName,
      name,
      role,
      phone,
      community,
      blood,
      bloodGroup,

      // 🆕 Maanadu fields
      maanaduEnabled,
      maanaduEventName,
      maanaduVehicleType,
      maanaduAmount,
      maanaduDate,
      maanaduNotes,
    } = req.body;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.team = team || teamName || member.team;
    member.teamName = teamName || team || member.teamName;
    member.name = name ?? member.name;
    member.role = role ?? member.role;
    member.phone = phone ?? member.phone;
    member.community = community ?? member.community;
    member.blood = blood || bloodGroup || member.blood;
    member.bloodGroup = bloodGroup || blood || member.bloodGroup;

    // 🆕 maanaduSupport update (keep old if not sent)
    const old = member.maanaduSupport || {};
    member.maanaduSupport = {
      enabled:
        typeof maanaduEnabled === "boolean"
          ? maanaduEnabled
          : old.enabled || false,
      eventName:
        maanaduEventName !== undefined ? maanaduEventName : old.eventName || "",
      vehicleType:
        maanaduVehicleType !== undefined
          ? maanaduVehicleType
          : old.vehicleType || "",
      amountSpent:
        typeof maanaduAmount === "number"
          ? maanaduAmount
          : old.amountSpent || 0,
      date:
        maanaduDate !== undefined
          ? maanaduDate
          : old.date || null,
      notes:
        maanaduNotes !== undefined ? maanaduNotes : old.notes || "",
    };

    const updated = await member.save();

    res.json(updated);
  } catch (err) {
    console.error("updateMember error:", err.message);
    res.status(500).json({ message: "Server error updating member" });
  }
};

// DELETE: DELETE /api/members/:id
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await member.deleteOne();

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("deleteMember error:", err.message);
    res.status(500).json({ message: "Server error deleting member" });
  }
};

// GET UNIQUE TEAMS: GET /api/members/teams
export const getTeamNames = async (req, res) => {
  try {
    const teams = await Member.distinct("teamName");
    return res.json(teams);
  } catch (err) {
    console.error("getTeamNames error:", err.message);
    res.status(500).json({ message: "Server error fetching teams" });
  }
};

// 📊 GET /api/members/stats
export const getMemberStats = async (req, res) => {
  try {
    // total members
    const totalMembersPromise = Member.countDocuments();

    // distinct teams
    const distinctTeamsPromise = Member.distinct("teamName");

    // team-wise stats
    const teamStatsPromise = Member.aggregate([
      {
        $group: {
          _id: "$teamName", // team wise
          members: { $sum: 1 },
          communities: { $addToSet: "$community" },
          bloodGroups: {
            $addToSet: {
              $ifNull: ["$bloodGroup", "$blood"],
            },
          },
        },
      },
      {
        $sort: { members: -1 }, // most members first
      },
    ]);

    // blood group wise stats (overall)
    const bloodStatsPromise = Member.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$bloodGroup", "$blood"] },
          members: { $sum: 1 },
        },
      },
      {
        $match: { _id: { $ne: null } },
      },
      { $sort: { members: -1 } },
    ]);

    const [totalMembers, distinctTeams, teamStatsRaw, bloodStats] =
      await Promise.all([
        totalMembersPromise,
        distinctTeamsPromise,
        teamStatsPromise,
        bloodStatsPromise,
      ]);

    const teamStats = teamStatsRaw.map((t) => ({
      teamName: t._id || "Unknown",
      members: t.members,
      communities: t.communities.filter(Boolean).length,
      bloodGroups: t.bloodGroups.filter(Boolean).length,
    }));

    const totalTeams = distinctTeams.filter(Boolean).length;

    const topTeam =
      teamStats.length > 0
        ? teamStats.reduce((max, t) =>
            t.members > max.members ? t : max
          )
        : null;

    res.json({
      totalMembers,
      totalTeams,
      teamStats,
      bloodStats: bloodStats.map((b) => ({
        bloodGroup: b._id,
        members: b.members,
      })),
      topTeam,
    });
  } catch (err) {
    console.error("getMemberStats error:", err.message);
    res
      .status(500)
      .json({ message: "Server error fetching member stats" });
  }
};

// 🆕 GET /api/members/maanadu  – only members who supported Maanadu (van/money)
export const getMaanaduMembers = async (req, res) => {
  try {
    const members = await Member.find({
      "maanaduSupport.enabled": true,
    }).sort({ "maanaduSupport.amountSpent": -1 });

    const totalContributors = members.length;
    const totalAmount = members.reduce(
      (sum, m) => sum + (m.maanaduSupport?.amountSpent || 0),
      0
    );

    res.json({
      totalContributors,
      totalAmount,
      members,
    });
  } catch (err) {
    console.error("getMaanaduMembers error:", err.message);
    res
      .status(500)
      .json({ message: "Server error fetching maanadu members" });
  }
};
