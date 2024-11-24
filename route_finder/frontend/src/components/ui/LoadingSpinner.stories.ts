import { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "./LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {
    loading: true,
  },
};
