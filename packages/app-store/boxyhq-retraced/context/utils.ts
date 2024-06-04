export enum BoxySetupStages {
  CREATION = "CREATION",
  CONFIRMATION = "CONFIRMATION",
}

export type BoxyHQCredentialState = BoxyHQCredentialConfirm | BoxyHQCredentialCreate;

export type BoxyHQCredentialConfirm = {
  boxyCredentialState: BoxySetupStages.CONFIRMATION;
  credentialInfo: {
    credentialId: number;
    url: string;
    options: { label: string; value: string; key: string }[];
  };
};

export type BoxyHQCredentialCreate = {
  boxyCredentialState: BoxySetupStages.CREATION;
  credentialInfo: undefined;
};

export type Action = {
  type: "afterCredentialCreation";
  payload: BoxyHQCredentialConfirm;
};

export const reducer = (state: BoxyHQCredentialState, action: Action) => {
  switch (action.type) {
    case "afterCredentialCreation":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

// Handlers
export const afterCredentialCreationSetup = (
  credentialId: number,
  url: string,
  options: { label: string; value: string; key: string }[]
): Action => {
  return {
    type: "afterCredentialCreation",
    payload: {
      boxyCredentialState: BoxySetupStages.CONFIRMATION,
      credentialInfo: { credentialId, url, options },
    },
  };
};

export const initialState = {
  boxyCredentialState: BoxySetupStages.CREATION as const,
  credentialInfo: undefined,
};
