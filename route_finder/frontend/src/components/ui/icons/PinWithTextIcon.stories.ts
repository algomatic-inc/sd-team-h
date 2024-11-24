import { Meta, StoryObj } from "@storybook/react";
import { PinWithTextIcon } from "./PinWithTextIcon";

const meta: Meta<typeof PinWithTextIcon> = {
  component: PinWithTextIcon,
};

export default meta;
type Story = StoryObj<typeof PinWithTextIcon>;

export const Default: Story = {
  args: {
    size: 24,
    pinText: "S",
  },
};
