import formatErrors from "./../formatErrors";
import requiresAuth from "./../permissions";

export default {
  Query: {
    allTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
      models.Team.findAll({ where: { owner: user.id } }, { raw: true })
    ),
    inviteTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
      models.sequelize.query("SELECT * FROM Teams JOIN Members ON id = team_id where user_id = ?", {
        replacements: [user.id],
        model: models.Team
      })
    )
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      // parent (or obj): The Previous Object, which for a field on the root Query type is often not used.
      // args: The arguments provided to the field in the GraphQL query.
      // context: A value which is provided to every resolver and holds important contextual information like the currently logged in user, or access to a DB.
      try {
        const response = await models.sequelize.transaction(async () => {
          const team = await models.Team.create({ ...args, owner: user.id });
          await models.Channel.create({ name: "general", public: true, teamId: team.id });
          return team;
        });
        return {
          ok: true,
          team: response
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models)
        };
      }
    }),
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, user }) => {
        try {
          const teamPromise = models.Team.findOne({ where: { id: user.id } }, { raw: true });
          const userToAddPromise = await models.User.findOne({ where: { email } }, { raw: true });
          const [team, userToAdd] = await Promise.all([teamPromise, userToAddPromise]);
          if (team.owner !== user.id) {
            return {
              ok: false,
              errors: [{ path: "email", message: "Cannot add members to team" }]
            };
          }
          if (!userToAdd) {
            return {
              ok: false,
              errors: [{ path: "email", messages: "Could not find user with this email." }]
            };
          }
          await models.Member.create({ userId: userToAdd.id, teamId });
          return {
            ok: true
          };
        } catch (err) {
          return {
            ok: false,
            errors: formatErrors(err, models)
          };
        }
      }
    )
  },
  Team: {
    channels: ({ id }, args, { models }) => models.Channel.findAll({ where: { teamId: id } })
  }
};
