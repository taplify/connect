export type ModalAction = {
  label: string;
  variant: "primary" | "secondary";
  onClick: () => void;
};
