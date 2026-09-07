"use client";

import { useState } from "react";

import { addToast, Button, Input, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";

export function PhoenixdRemoteFields({
  phoenixdRemote,
  phoenixdUrl,
  phoenixdPassword,
  onPhoenixdRemoteChange,
  onPhoenixdUrlChange,
  onPhoenixdPasswordChange,
  onTestConnection,
  onLoadWebhookUrl,
}) {
  const phoenixdRemoteTranslations = useTranslations("phoenixdRemote");
  const [testingConnection, setTestingConnection] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loadingWebhookUrl, setLoadingWebhookUrl] = useState(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await onTestConnection(phoenixdUrl, phoenixdPassword);
      addToast({ color: "success", description: phoenixdRemoteTranslations("testSuccess") });
    } catch (testConnectionError) {
      addToast({
        color: "danger",
        description: testConnectionError.message || phoenixdRemoteTranslations("testError"),
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLoadWebhookUrl = async () => {
    setLoadingWebhookUrl(true);
    try {
      const webhookUrlResponse = await onLoadWebhookUrl();
      setWebhookUrl(webhookUrlResponse?.webhookUrl || "");
    } catch {
      addToast({ color: "danger", description: phoenixdRemoteTranslations("webhookLoadError") });
    } finally {
      setLoadingWebhookUrl(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-700">{phoenixdRemoteTranslations("remoteToggleLabel")}</span>
          <span className="text-sm text-gray-500">{phoenixdRemoteTranslations("remoteToggleDescription")}</span>
        </div>
        <Switch
          isSelected={phoenixdRemote}
          onValueChange={onPhoenixdRemoteChange}
          aria-label={phoenixdRemoteTranslations("remoteToggleLabel")}
        />
      </div>

      {phoenixdRemote && (
        <div className="space-y-3">
          <Input
            label={phoenixdRemoteTranslations("urlLabel")}
            placeholder="http://100.x.x.x:9740"
            value={phoenixdUrl}
            onValueChange={onPhoenixdUrlChange}
            classNames={{ input: "font-mono text-xs" }}
          />
          <Input
            label={phoenixdRemoteTranslations("passwordLabel")}
            type="password"
            value={phoenixdPassword}
            onValueChange={onPhoenixdPasswordChange}
          />

          <Button
            color="primary"
            className="bg-green-800 h-8 min-w-16 px-3 rounded-small sm:h-10 sm:min-w-20 sm:px-4 sm:rounded-medium"
            isDisabled={!phoenixdUrl || !phoenixdPassword || testingConnection}
            isLoading={testingConnection}
            onPress={handleTestConnection}
          >
            {phoenixdRemoteTranslations("testButton")}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>{phoenixdRemoteTranslations("webhookDescription")}</p>
            {webhookUrl ? (
              <code className="block break-all bg-gray-100 rounded p-2">{webhookUrl}</code>
            ) : (
              <button
                type="button"
                onClick={handleLoadWebhookUrl}
                disabled={loadingWebhookUrl}
                className="text-green-800 underline"
              >
                {phoenixdRemoteTranslations("showWebhookButton")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
