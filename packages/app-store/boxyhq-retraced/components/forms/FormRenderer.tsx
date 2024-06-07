import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";

import { Form, PasswordField, InputField, Skeleton, Select, Label, Button } from "@calcom/ui";

const FormFieldRenderer = ({
  element,
  form,
  isLoading,
  isLast,
  showInternalButton,
}: {
  element: any;
  form: any;
  isLoading?: boolean;
  isLast?: boolean;
  showInternalButton?: boolean;
}) => {
  switch (element.type) {
    case "password": {
      return (
        <Controller
          name={element.name}
          control={form.control}
          render={({ field: { onBlur, onChange, value } }) => {
            return (
              <div className="col-span-4 col-start-2 row-start-3 flex flex-row items-end space-x-5">
                <PasswordField
                  onChange={onChange}
                  onBlur={onBlur}
                  name={element.label}
                  value={value}
                  className="mb-0"
                  containerClassName="w-[100%] data-[dirty=true]:w-[90%] duration-300"
                />{" "}
                {isLast && showInternalButton && (
                  <Button
                    type="submit"
                    data-dirty={form.formState.isDirty}
                    className="mb-1 data-[dirty=false]:hidden "
                    loading={isLoading}>
                    Submit
                  </Button>
                )}
              </div>
            );
          }}
        />
      );
    }
    case "string": {
      return (
        <Controller
          name={element.name}
          control={form.control}
          render={({ field: { onBlur, onChange, value } }) => (
            <div className="col-span-4 col-start-2 row-start-2 flex flex-row items-end space-x-5">
              <InputField
                required
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                name={element.label}
                className="mb-1"
                containerClassName="w-[100%]"
              />
              {isLast && showInternalButton && (
                <Button
                  type="submit"
                  data-dirty={form.formState.isDirty}
                  className="mb-1 data-[dirty=false]:hidden "
                  loading={isLoading}>
                  Submit
                </Button>
              )}
            </div>
          )}
        />
      );
    }
    case "select": {
      return (
        <Controller
          name={element.name}
          control={form.control}
          render={({ field: { onBlur, onChange, value } }) => {
            return (
              <div className="col-span-4 col-start-2 row-start-3 flex flex-col items-start">
                <Skeleton as={Label} loadingClassName="w-16">
                  {element.label}
                </Skeleton>
                <div className="col-span-4 col-start-2 row-start-2 flex w-[100%] flex-row items-end space-x-5">
                  <Select
                    className="w-[100%] capitalize"
                    options={element.options}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  />{" "}
                  {isLast && showInternalButton && (
                    <Button
                      type="submit"
                      data-dirty={form.formState.isDirty}
                      className="mb-0 data-[dirty=false]:hidden "
                      loading={isLoading}>
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            );
          }}
        />
      );
    }
    default:
      return null;
  }
};

export const FormRenderer = forwardRef(
  (
    {
      fields,
      FormZodSchema,
      onSubmit,
      defaultValues,
      isLoading,
      showInternalButton,
    }: {
      fields: any[];
      FormZodSchema: any;
      onSubmit: any;
      defaultValues?: any;
      isLoading?: boolean;
      showInternalButton?: boolean;
    },
    ref
  ) => {
    const form = useForm({
      resolver: zodResolver(FormZodSchema),
      defaultValues: defaultValues,
    });
    const handleSubmit = form.handleSubmit(onSubmit);
    const reset = form.reset;

    useImperativeHandle(ref, () => ({
      submit() {
        handleSubmit();
      },
      reset(values: any) {
        reset(values);
      },
      getValues() {
        return form.getValues();
      },
      isDirty: form.formState.isDirty,
    }));

    return (
      <Form
        form={form}
        handleSubmit={handleSubmit}
        className="flex w-[100%] flex-col justify-between space-y-4">
        {fields.map((element: any, index: any, { length }) => (
          <FormFieldRenderer
            key={index}
            element={element}
            form={form}
            isLast={length - 1 === index}
            isLoading={isLoading}
            showInternalButton={showInternalButton}
          />
        ))}
      </Form>
    );
  }
);
FormRenderer.displayName = "FormRenderer";
