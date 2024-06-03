import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Form, InputField, Button, Select, Skeleton, Label } from "@calcom/ui";

import type { AppKeys, ClientSafeAppKeysSchema } from "../zod";

export enum FormAction {
  CREATE,
  UPDATE,
}

type CredentialsFormProps = {
  form: UseFormReturn<ClientSafeAppKeysSchema, any>;
  hideBtn?: boolean;
  options: { label: string; value: string; key: string }[];
} & (CredentialCreationForm | CredentialUpdateForm);

export type CredentialCreationForm = { action: FormAction.CREATE; onCreate?: (props: AppKeys) => void };
export type CredentialUpdateForm = {
  action: FormAction.UPDATE;
  credentialId: number;
  onSubmit?: (props: { key: AppKeys; credentialId: number }) => void;
};

export const CredentialsForm = (props: CredentialsFormProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Form
      form={props.form}
      className="flex w-[100%] flex-col justify-between space-y-4"
      handleSubmit={async (values) => {
        console.log({ values });
        // try {
        //   setLoading(true);
        //   if (props.action === FormAction.UPDATE && props.onSubmit) {
        //     props.onSubmit({
        //       credentialId: props.credentialId,
        //       key: values,
        //     });
        //   } else if (props.action === FormAction.CREATE && props.onCreate) {
        //     props.onCreate(values);
        //   } else {
        //     showToast("Error. Please contact your developer.", "error");
        //   }

        //   setLoading(false);
        // } catch (e) {
        //   console.log(e);
        // }
      }}>
      <Controller
        name="projectId"
        control={props.form.control}
        render={({ field: { onBlur, onChange, value } }) => (
          <div className="col-span-4 col-start-2 row-start-1 flex flex-row items-end space-x-5">
            <InputField
              required
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              name="Project Name"
              className="mb-1"
              containerClassName="w-[100%]"
            />
          </div>
        )}
      />
      <Controller
        name="endpoint"
        control={props.form.control}
        render={({ field: { onBlur, onChange, value } }) => (
          <div className="col-span-4 col-start-2 row-start-2 flex flex-row items-end space-x-5">
            <InputField
              required
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              name="Endpoint"
              className="mb-1"
              containerClassName="w-[100%]"
            />
          </div>
        )}
      />
      <Controller
        name="activeEnvironment"
        control={props.form.control}
        render={({ field: { onBlur, onChange, value } }) => {
          return (
            <div className="col-span-4 col-start-2 row-start-3 flex flex-col items-start">
              <Skeleton as={Label} loadingClassName="w-16">
                Active Environment
              </Skeleton>
              <div className="col-span-4 col-start-2 row-start-2 flex w-[100%] flex-row items-end space-x-5">
                <Select
                  className="w-[100%] capitalize"
                  options={props.options}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  name="Active Environment"
                />{" "}
                {props.hideBtn ?? (
                  <Button
                    data-dirty={props.form.formState.isDirty}
                    className="mb-1 data-[dirty=false]:hidden "
                    loading={loading}
                    type="submit">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          );
        }}
      />
    </Form>
  );
};
