import { useState } from "react";

import { capitalize } from "@/helpers/string";
import { Capitalize } from "@/types/string";

type UseModalReturnType<T extends string> = {
  [K in `is${Capitalize<T>}ModalOpen`]: boolean;
} & {
  [K in `open${Capitalize<T>}Modal`]: () => void;
} & {
  [K in `close${Capitalize<T>}Modal`]: () => void;
};

const useModal = <T extends string>(id: T): UseModalReturnType<T> => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    [`is${capitalize(id)}ModalOpen`]: isOpen,
    [`open${capitalize(id)}Modal`]: openModal,
    [`close${capitalize(id)}Modal`]: closeModal,
  } as UseModalReturnType<T>;
};

export default useModal;
