import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button, showToast } from "@calcom/ui";
import { Form, PasswordField } from "@calcom/ui";

import appConfig from "../config.json";
import { useAppCredential } from "../context/CredentialContext";
import type { BoxyGeneralSettingsOption } from "../lib/utils";
import PreAdminActionDialog from "./PreAdminActionDialog";

export const BoxyHQTemplatesSettingsOptionCard = ({ option }: { option: BoxyGeneralSettingsOption }) => {
  const [animationRef] = useAutoAnimate<HTMLDivElement>();
  const { data, isLoading, credentialId } = useAppCredential();
  const [isOpen, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  function handleOpenChange() {
    setOpen((isOpen) => !isOpen);
  }

  const form = useForm<{ adminKey: string }>({
    resolver: zodResolver(z.object({ adminKey: z.string().min(1) })),
  });

  const mutation = useMutation({
    mutationFn: async ({ adminKey }: { adminKey: string }) => {
      const response = await fetch(`/api/integrations/${appConfig.slug}/createTemplates`, {
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
        onConfirm={(e) => console.log("hehy")}
        confirmBtn={
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit((values) => mutation.mutate(values))}>
            Confirm
          </Button>
        }>
        <Form
          form={form}
          className="mb-7 flex w-[100%] flex-col justify-between space-y-4"
          handleSubmit={() => form.handleSubmit((e) => console.log(e))}>
          <p className="mb-7 mt-1">
            We need your Admin Root Key to perform this action. This information will not be saved by Cal.com
          </p>

          <Controller
            name="adminKey"
            control={form.control}
            render={({ field: { onBlur, onChange, value } }) => (
              <div className="col-span-4 col-start-2 row-start-1 flex flex-row items-end space-x-5">
                <PasswordField
                  onChange={onChange}
                  onBlur={onBlur}
                  name="Admin Key"
                  value={value}
                  className="mb-0"
                  containerClassName="w-[100%] data-[dirty=true]:w-[90%] duration-300"
                />
              </div>
            )}
          />
        </Form>
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
          <Button onClick={() => setOpen(true)} disabled={data?.isInvalid ?? false}>
            {isLoading ? "Loading..." : data?.settings.templateSetup ? option.resetButton : option.button}
          </Button>
        </div>
      </div>
    </>
  );
};
