export enum BoxySetupStages {
  CREATION = "CREATION",
  CONFIRMATION = "CONFIRMATION",
  TEMPLATE_CREATION = "TEMPLATE_CREATION",
}

export type BoxyHQCredentialState =
  | BoxyHQCredentialConfirm
  | BoxyHQCredentialTemplateCreation
  | BoxyHQCredentialCreate;

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

export type BoxyHQCredentialTemplateCreation = {
  boxyCredentialState: BoxySetupStages.TEMPLATE_CREATION;
};

export type Action =
  | {
      type: "credentialCreated";
      payload: BoxyHQCredentialConfirm;
    }
  | {
      type: "creatingTemplates";
      payload: BoxyHQCredentialTemplateCreation;
    };

export const reducer = (state: BoxyHQCredentialState, action: Action) => {
  switch (action.type) {
    case "credentialCreated":
      return {
        ...state,
        ...action.payload,
      };
    case "creatingTemplates":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

// Handlers
export const credentialCreated = (
  credentialId: number,
  url: string,
  options: { label: string; value: string; key: string }[]
): Action => {
  return {
    type: "credentialCreated",
    payload: {
      boxyCredentialState: BoxySetupStages.CONFIRMATION,
      credentialInfo: { credentialId, url, options },
    },
  };
};

export const creatingTemplates = (): Action => {
  return {
    type: "creatingTemplates",
    payload: {
      boxyCredentialState: BoxySetupStages.TEMPLATE_CREATION,
    },
  };
};

export const initialState: BoxyHQCredentialCreate = {
  boxyCredentialState: BoxySetupStages.CREATION as const,
  credentialInfo: undefined,
};
