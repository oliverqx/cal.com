import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { Form, PasswordField } from "@calcom/ui";

export function AdminKeyForm({
  form,
}: {
  form: UseFormReturn<
    {
      adminKey: string;
    },
    any
  >;
}) {
  return (
    <Form
      form={form}
      className="my-7 flex w-[100%] flex-col justify-between space-y-4"
      handleSubmit={() => form.handleSubmit((e) => console.log(e))}>
      <Controller
        name="adminKey"
        control={form.control}
        render={({ field: { onBlur, onChange, value } }) => (
          <div className="col-span-4 col-start-2 row-start-1 flex flex-row items-end space-x-5">
            <PasswordField
              hint="We need your Admin Root Key to perform this action. This information will not be saved by Cal.com"
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
  );
}
