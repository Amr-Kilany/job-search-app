import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLID } from "graphql";
import UserModel from "../../DB/Models/User.model.js";
import CompanyModel from "../../DB/Models/Company.model.js";
import * as DB from "../../DB/database.repository.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    isBanned: { type: GraphQLBoolean },
  }),
});

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    approvedByAdmin: { type: GraphQLBoolean },
  }),
});

const AdminDashboardType = new GraphQLObjectType({
  name: "AdminDashboardData",
  fields: () => ({
    users: { type: new GraphQLList(UserType) },
    companies: { type: new GraphQLList(CompanyType) },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAdminDashboardData: {
      type: AdminDashboardType,
      async resolve(_parent, _args, context) {
        if (context.user?.role !== RoleEnum.ADMIN) {
          throw new Error("Unauthorized: Only Admins can access GraphQL dashboard data.");
        }

        const users = await DB.find({ model: UserModel });
        const companies = await DB.find({ model: CompanyModel });

        return { users, companies };
      },
    },
  },
});

export const adminGraphQLSchema = new GraphQLSchema({
  query: RootQuery,
});
