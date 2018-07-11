export default (sequelize, DataTypes) => {
  const Channel = sequelize.define("channel", {
    name: DataTypes.STRING,
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Channel.associate = models => {
    // 1.M
    // belongsTo: add a foreign key and singular association mixins to the source.
    Channel.belongsTo(models.Team, {
      foreignKey: {
        name: "teamId",
        field: "team_id"
      }
    });
    // N:M
    // belongsToMany: creates an N:M association with a join table and adds plural association mixins to the source. The junction table is created with sourceId and targetId.
    Channel.belongsToMany(models.User, {
      through: "channel_member",
      foreignKey: {
        name: "channelId",
        field: "channel_id"
      }
    });
  };
  return Channel;
};
