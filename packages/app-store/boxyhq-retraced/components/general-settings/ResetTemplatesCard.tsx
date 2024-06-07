import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button, showToast } from "@calcom/ui";

import appConfig from "../../config.json";
import { useAppCredential } from "../../context/CredentialContext";
import type { ResetSettingsOption } from "../../lib/utils";
import PreAdminActionDialog from "../PreAdminActionDialog";

export const ResetTemplatesCard = ({ option }: { option: ResetSettingsOption }) => {
  const [animationRef] = useAutoAnimate<HTMLDivElement>();
  const { credentialId } = useAppCredential();
  const [isOpen, setOpen] = useState(false);
  function handleOpenChange() {
    setOpen((isOpen) => !isOpen);
  }

  const form = useForm<{ adminKey: string }>({
    resolver: zodResolver(z.object({ adminKey: z.string().min(1) })),
  });

  const { mutate: resetTemplates, isPending } = useMutation({
    mutationFn: async ({ adminKey }: { adminKey: string }) => {
      const response = await fetch(`/api/integrations/${appConfig.slug}/resetTemplates`, {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          credentialId,
          adminRootToken: adminKey,
        }),
      });

      if (response.status === 200) {
        showToast("Templates created successfully.", "success");
      } else {
        showToast("Templates creation failed. Please ensure your credentials are valid.", "error");
      }

      setOpen(false);

      return {
        status: response.status,
        message: response.statusText,
        lastCheck: new Date().toLocaleString(),
      };
    },
  });

  return (
    <>
      <PreAdminActionDialog
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isLoading={isPending}
        onConfirm={(e) => console.log("This function will be removed later.")}
        confirmBtn={
          <Button type="submit" onClick={form.handleSubmit((values) => resetTemplates(values))}>
            Confirm
          </Button>
        }>
        {/* <AdminKeyForm form={form} /> */}
        <h1>hey</h1>
      </PreAdminActionDialog>
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
          <Button onClick={() => setOpen(true)}>{option.button}</Button>
        </div>
      </div>
    </>
  );
};
