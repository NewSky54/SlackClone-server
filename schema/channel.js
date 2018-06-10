export default `
  type Channel {
    id: Int!
    name: String!
    messages: [Message!]!
    users: [User!]!
  }

  type Mutation {
    createChannel(teamId: Int!, name: String!, public: Boolean=false): Boolean!
  }

`;