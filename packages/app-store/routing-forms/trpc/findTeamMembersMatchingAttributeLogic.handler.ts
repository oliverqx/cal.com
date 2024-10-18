import type { ServerResponse } from "http";
import type { NextApiResponse } from "next";

import { entityPrismaWhereClause } from "@calcom/lib/entityPermissionUtils";
import { UserRepository } from "@calcom/lib/server/repository/user";
import type { PrismaClient } from "@calcom/prisma";
import { TRPCError } from "@calcom/trpc/server";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";

import { getSerializableForm } from "../lib/getSerializableForm";
import type { TFindTeamMembersMatchingAttributeLogicInputSchema } from "./findTeamMembersMatchingAttributeLogic.schema";
import { findTeamMembersMatchingAttributeLogicOfRoute } from "./utils";

interface FindTeamMembersMatchingAttributeLogicHandlerOptions {
  ctx: {
    prisma: PrismaClient;
    user: NonNullable<TrpcSessionUser>;
    res: ServerResponse | NextApiResponse | undefined;
  };
  input: TFindTeamMembersMatchingAttributeLogicInputSchema;
}

export const findTeamMembersMatchingAttributeLogicHandler = async ({
  ctx,
  input,
}: FindTeamMembersMatchingAttributeLogicHandlerOptions) => {
  const { prisma, user } = ctx;
  const { formId, response, routeId, _enablePerf, _concurrency } = input;

  const form = await prisma.app_RoutingForms_Form.findFirst({
    where: {
      id: formId,
      ...entityPrismaWhereClause({ userId: user.id }),
    },
  });

  if (!form) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Form not found",
    });
  }

  if (!form.teamId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This form is not associated with a team",
    });
  }

  const serializableForm = await getSerializableForm({ form });

  const {
    teamMembersMatchingAttributeLogic: matchingTeamMembersWithResult,
    timeTaken: teamMembersMatchingAttributeLogicTimeTaken,
  } = await findTeamMembersMatchingAttributeLogicOfRoute(
    {
      response,
      routeId,
      form: serializableForm,
      teamId: form.teamId,
    },
    {
      enablePerf: _enablePerf,
      concurrency: _concurrency,
    }
  );

  if (!matchingTeamMembersWithResult) {
    return null;
  }
  const matchingTeamMembersIds = matchingTeamMembersWithResult.map((member) => member.userId);
  const matchingTeamMembers = await UserRepository.findByIds({ ids: matchingTeamMembersIds });

  if (_enablePerf) {
    ctx.res?.setHeader("Server-Timing", getServerTimingHeader(teamMembersMatchingAttributeLogicTimeTaken));
  }

  return matchingTeamMembers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));
};

function getServerTimingHeader(timeTaken: {
  gAtr: number | null;
  gQryCnfg: number | null;
  gMbrWtAtr: number | null;
  lgcFrMbrs: number | null;
  gQryVal: number | null;
}) {
  const headerParts = Object.entries(timeTaken).map(([key, value]) => {
    if (value !== null) {
      return `${key};dur=${value}`;
    }
    return null;
  }).filter(Boolean);

  return headerParts.join(', ');
}

export default findTeamMembersMatchingAttributeLogicHandler;
