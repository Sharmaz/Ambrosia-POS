"use client";

import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";

export function PhoenixdRemoteCardLocked({ onReveal, phoenixdRemoteCardTranslations }) {
  return (
    <Card shadow="none" className="rounded-lg mb-6 p-6 shadow-lg">
      <CardHeader className="flex flex-col items-start pb-0">
        <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold text-green-900">
          {phoenixdRemoteCardTranslations("phoenixdRemoteCard.title")}
        </h2>
      </CardHeader>

      <CardBody>
        <p className="text-sm text-gray-500">
          {phoenixdRemoteCardTranslations("phoenixdRemoteCard.description")}
        </p>
      </CardBody>

      <CardFooter>
        <Button
          color="primary"
          className="bg-green-800 h-8 min-w-16 px-3 rounded-small sm:h-10 sm:min-w-20 sm:px-4 sm:rounded-medium"
          onPress={onReveal}
        >
          {phoenixdRemoteCardTranslations("phoenixdRemoteCard.manageButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
