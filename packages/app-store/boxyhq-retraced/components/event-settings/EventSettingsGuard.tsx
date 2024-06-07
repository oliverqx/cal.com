import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { z } from "zod";

import { Button } from "@calcom/ui";
import { showToast } from "@calcom/ui";

import appConfig from "../../config.json";
import { useAppCredential } from "../../context/CredentialContext";
import { FormRenderer } from "../forms/FormRenderer";
import type { BoxyTemplate } from "./EventSettingsInterface";
import { EventSettingsInterface } from "./EventSettingsInterface";

const ZAdminKeyForm = z.object({ sudoKey: z.string() });

export function EventSettingsGuard() {
  const { setSudoKey, sudoKey, credentialId } = useAppCredential();

  const projectUpdateFormFields = [
    {
      name: "sudoKey",
      label: "Admin Key",
      type: "password",
    },
  ];
  const refForm = useRef<any | null>(null);

  const { data: templates, isLoading: isFetchingTemplates } = useQuery({
    queryKey: ["getTemplates", credentialId.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/${appConfig.slug}/getTemplates`, {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          credentialId,
          sudoKey,
        }),
      });

      const body = await response.json();

      const templates = body.message.templates;

      const templateMap: Map<string, BoxyTemplate> = new Map();
      templates.map((template: BoxyTemplate) => templateMap.set(template.name, template));

      if (response.status === 200) {
        showToast("Templates retrieved successfully.", "success");
      } else {
        showToast("Templates retrieval failed. Please ensure your credentials are valid.", "error");
      }

      return templateMap;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!sudoKey,
  });

  if (!sudoKey || !templates)
    return (
      <div className="flex h-full w-full flex-col justify-between ">
        <p className="max-w-28 sm:max-w-72 md:max-w-80 inline truncate tracking-wide md:block xl:max-w-full">
          To access event settings we need your BoxyHQ Admin Root Key.
        </p>
        <div>
          <FormRenderer
            ref={refForm}
            fields={projectUpdateFormFields}
            FormZodSchema={ZAdminKeyForm}
            onSubmit={(values: { sudoKey: string }) => setSudoKey(values.sudoKey)}
          />
          <p className="text-[13px] opacity-[0.6]">Cal.com will not save this information.</p>
        </div>
        <div className="flex w-full justify-end">
          <Button onClick={() => refForm.current.submit()} loading={isFetchingTemplates}>
            Next
          </Button>
        </div>
      </div>
    );
  else {
    return <EventSettingsInterface templates={templates} />;
  }
}
