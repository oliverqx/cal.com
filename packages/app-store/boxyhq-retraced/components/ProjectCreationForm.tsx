import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Form, PasswordField, InputField } from "@calcom/ui";

import type { BoxyProjectCreationInput } from "../zod";

export enum FormAction {
  CREATE,
  UPDATE,
}

type CredentialsFormProps = {
  form: UseFormReturn<BoxyProjectCreationInput, any>;
};

export const ProjectCreationForm = (props: CredentialsFormProps) => {
  return (
    <Form
      form={props.form}
      handleSubmit={() => props.form.handleSubmit((e) => console.log(e))}
      className="flex w-[100%] flex-col justify-between space-y-4">
      <Controller
        name="projectName"
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
        name="boxyHqEndpoint"
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
        name="sudoKey"
        control={props.form.control}
        render={({ field: { onBlur, onChange, value } }) => {
          return (
            <div className="col-span-4 col-start-2 row-start-3 flex flex-row items-end space-x-5">
              <PasswordField
                onChange={onChange}
                onBlur={onBlur}
                name="Admin Root Key"
                value={value}
                className="mb-0"
                containerClassName="w-[100%] data-[dirty=true]:w-[90%] duration-300"
              />{" "}
            </div>
          );
        }}
      />
    </Form>
  );
};
