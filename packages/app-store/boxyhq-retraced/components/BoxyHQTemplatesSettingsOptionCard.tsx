import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation } from "@tanstack/react-query";
import React from "react";

import { Button, showToast } from "@calcom/ui";

import appConfig from "../config.json";
import { useAppCredential } from "../context/CredentialContext";
import type { BoxyGeneralSettingsOption } from "../lib/utils";

export const BoxyHQTemplatesSettingsOptionCard = ({ option }: { option: BoxyGeneralSettingsOption }) => {
  const [animationRef] = useAutoAnimate<HTMLDivElement>();
  const { data, isLoading } = useAppCredential();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/integrations/${appConfig.slug}/createTemplates`, {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          credentialId: 4,
        }),
      });

      if (response.status === 200) {
        showToast("Templates created successfully.", "success");
      } else {
        showToast("Templates creation failed. Please ensure your credentials are valid.", "error");
      }

      return {
        status: response.status,
        message: response.statusText,
        lastCheck: new Date().toLocaleString(),
      };
    },
  });

  return (
    <div className="border-subtle flex items-center justify-between rounded-md border">
      <div className="p-4 sm:p-4">
        <div className="flex w-full flex-col gap-2 sm:gap-0">
          <div className="text-emphasis">
            <span className="font-semi-bold text-sm">{option?.name}</span>
          </div>
          <p className="text-default line-clamp-1 pt-1 text-xs font-normal">{option?.description}</p>
        </div>
      </div>
      <div ref={animationRef} className="p-4">
        <Button onClick={() => mutation.mutate()} disabled={data?.isInvalid ?? false}>
          {isLoading ? "Loading..." : data?.settings.templateSetup ? option.resetButton : option.button}
        </Button>
      </div>
    </div>
  );
};
