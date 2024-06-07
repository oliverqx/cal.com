import { useRef } from "react";
import { z } from "zod";

import { Button } from "@calcom/ui";

import { useAppCredential } from "../../context/CredentialContext";
import { FormRenderer } from "../forms/FormRenderer";
import { EventSettingsInterface } from "./EventSettingsInterface";

const ZAdminKeyForm = z.object({ sudoKey: z.string() });

export function EventSettings() {
  const { setSudoKey, sudoKey } = useAppCredential();

  const projectUpdateFormFields = [
    {
      name: "sudoKey",
      label: "Admin Key",
      type: "password",
    },
  ];
  const refForm = useRef<any | null>(null);

  if (!sudoKey)
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
          <Button onClick={() => refForm.current.submit()}>Next</Button>
        </div>
      </div>
    );
  else {
    return <EventSettingsInterface />;
  }
}
