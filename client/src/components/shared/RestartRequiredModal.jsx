"use client";

import { useEffect, useState } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useTranslations } from "next-intl";

export function RestartRequiredModal({ isOpen, onAcknowledge, countdownSeconds }) {
  const restartModalTranslations = useTranslations("restartRequiredModal");
  const isCountingDown = countdownSeconds != null;
  const [secondsRemaining, setSecondsRemaining] = useState(countdownSeconds);

  useEffect(() => {
    if (!isCountingDown || !isOpen) return undefined;
    if (secondsRemaining <= 0) {
      onAcknowledge();
      return undefined;
    }
    const countdownTimer = setTimeout(() => setSecondsRemaining((current) => current - 1), 1000);
    return () => clearTimeout(countdownTimer);
  }, [isCountingDown, isOpen, secondsRemaining, onAcknowledge]);

  return (
    <Modal
      isOpen={isOpen}
      isDismissable={false}
      hideCloseButton
      backdrop="blur"
      classNames={{
        backdrop: "backdrop-blur-xs bg-white/10",
      }}
    >
      <ModalContent>
        <ModalHeader>{restartModalTranslations("title")}</ModalHeader>
        <ModalBody>
          <p>{restartModalTranslations(isCountingDown ? "countdownDescription" : "description")}</p>
          {isCountingDown && (
            <p className="text-3xl font-bold text-center text-green-900">{secondsRemaining}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="bg-green-800" onPress={onAcknowledge}>
            {restartModalTranslations(isCountingDown ? "restartNowButton" : "acknowledgeButton")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
