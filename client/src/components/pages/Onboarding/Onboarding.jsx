"use client";

import { useEffect, useRef, useState } from "react";

import { Button, Divider, addToast } from "@heroui/react";
import { useTranslations } from "next-intl";

import { parseJsonResponse } from "@/lib/http";
import { useUpload } from "@components/hooks/useUpload";
import { LanguageSwitcher } from "@i18n/I18nProvider";
import { getInitialSetupStatus, submitInitialSetup } from "@services/initialSetupService";

import { BusinessDetailsStep } from "./AddBusinessData";
import { UserAccountStep } from "./AddUserAccount";
import { RestoreFromBackupStep } from "./RestoreFromBackup";
import { BusinessTypeStep } from "./SelectBusiness";
import { WizardSummary } from "./StepsSummary";
import { WalletBackendStep } from "./WalletBackendStep";

const TOAST_REDIRECT_TIMEOUT_MS = 3000;

function addRedirectToast(toastProps) {
  addToast({
    ...toastProps,
    timeout: TOAST_REDIRECT_TIMEOUT_MS,
    shouldShowTimeoutProgress: true,
  });
}

export function Onboarding() {
  const onboardingTranslations = useTranslations();
  const [step, setStep] = useState(1);
  const [activeView, setActiveView] = useState("setup");
  const [setupStatus, setSetupStatus] = useState(null);
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);
  const isSubmittingSetupRef = useRef(false);
  const [onboardingData, setOnboardingData] = useState({
    businessType: "store",
    walletBackend: "phoenixd",
    nwcUri: "",
    phoenixdRemote: false,
    phoenixdUrl: "",
    phoenixdPassword: "",
    userName: "",
    userPassword: "",
    userPasswordConfirmation: "",
    userPin: "",
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    businessRFC: "",
    businessCurrency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    businessLogo: null,
  });
  const { upload } = useUpload();
  const needsBusinessType = setupStatus?.needsBusinessType === true;

  useEffect(() => {
    let isMounted = true;
    const loadStatus = async () => {
      try {
        const status = await getInitialSetupStatus();
        const statusData = await parseJsonResponse(status, null);
        if (!isMounted) return;
        setSetupStatus(statusData);
        if (statusData?.needsBusinessType) {
          setOnboardingData((prev) => ({ ...prev, businessType: "" }));
        }
      } catch {
        if (!isMounted) return;
        setSetupStatus({ initialized: false, needsBusinessType: false });
      }
    };

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  function isPasswordStrong(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
  }

  function isPinValid(pin) {
    return /^\d{4}$/.test(pin);
  }

  const NWC_URI_REGEX = /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?/;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleDataChange = (newData) => {
    setOnboardingData((prev) => ({ ...prev, ...newData }));
  };

  const handleComplete = async () => {
    if (isSubmittingSetupRef.current) return;
    isSubmittingSetupRef.current = true;
    setIsSubmittingSetup(true);

    try {
      if (needsBusinessType) {
        await submitInitialSetup({
          businessType: onboardingData.businessType,
        });
        addRedirectToast({
          title: onboardingTranslations("submitOnboardingToast.title"),
          description: onboardingTranslations("submitOnboardingToast.description"),
          color: "success",
          onClose: () => window.location.reload(),
        });
        return;
      }

      let logoUrl = null;
      if (onboardingData.businessLogo) {
        const [uploaded] = await upload([onboardingData.businessLogo]);
        logoUrl = uploaded?.url ?? uploaded?.path;
      }

      const isPhoenixdRemoteAttempt = onboardingData.walletBackend === "phoenixd" && Boolean(onboardingData.phoenixdRemote);

      const setupResponse = await submitInitialSetup({
        ...onboardingData,
        businessLogoUrl: logoUrl,
        businessLogo: undefined,
        userPasswordConfirmation: undefined,
        walletBackend: undefined,
        nwcUri: onboardingData.walletBackend === "nwc" && onboardingData.nwcUri ? onboardingData.nwcUri : undefined,
        phoenixdRemote: isPhoenixdRemoteAttempt ? true : undefined,
        phoenixdUrl: isPhoenixdRemoteAttempt ? onboardingData.phoenixdUrl : undefined,
        phoenixdPassword: isPhoenixdRemoteAttempt ? onboardingData.phoenixdPassword : undefined,
      });

      const isNwcAttempt = onboardingData.walletBackend === "nwc";
      let nwcSaved = false;
      let phoenixdRemoteSaved = false;
      try {
        const body = await setupResponse.json();
        nwcSaved = Boolean(body?.nwcSaved);
        phoenixdRemoteSaved = Boolean(body?.phoenixdRemoteSaved);
      } catch {}

      addRedirectToast({
        title: onboardingTranslations("submitOnboardingToast.title"),
        description: onboardingTranslations("submitOnboardingToast.description"),
        color: "success",
        onClose: (isNwcAttempt || isPhoenixdRemoteAttempt) ? undefined : () => window.location.reload(),
      });

      if (nwcSaved) {
        addRedirectToast({
          title: onboardingTranslations("submitOnboardingToast.nwcSavedTitle"),
          description: onboardingTranslations("submitOnboardingToast.nwcSavedDescription"),
          color: "primary",
          onClose: () => window.location.reload(),
        });
      } else if (isNwcAttempt) {
        addRedirectToast({
          title: onboardingTranslations("submitOnboardingToast.nwcErrorTitle"),
          description: onboardingTranslations("submitOnboardingToast.nwcErrorDescription"),
          color: "danger",
          onClose: () => window.location.reload(),
        });
      } else if (phoenixdRemoteSaved) {
        addRedirectToast({
          title: onboardingTranslations("submitOnboardingToast.phoenixdRemoteSavedTitle"),
          description: onboardingTranslations("submitOnboardingToast.phoenixdRemoteSavedDescription"),
          color: "primary",
          onClose: () => window.location.reload(),
        });
      } else if (isPhoenixdRemoteAttempt) {
        addRedirectToast({
          title: onboardingTranslations("submitOnboardingToast.phoenixdRemoteErrorTitle"),
          description: onboardingTranslations("submitOnboardingToast.phoenixdRemoteErrorDescription"),
          color: "danger",
          onClose: () => window.location.reload(),
        });
      }
    } catch (setupSubmissionError) {
      addToast({
        title: onboardingTranslations("submitOnboardingToast.errorTitle"),
        description: setupSubmissionError.message,
        color: "danger",
      });
    } finally {
      isSubmittingSetupRef.current = false;
      setIsSubmittingSetup(false);
    }
  };

  const totalSteps = needsBusinessType ? 1 : 5;
  const progressValue = totalSteps === 1 ? 100 : ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen gradient-fresh px-4 pb-4 pt-4">
      <div className="flex justify-end w-full max-w-2xl mt-2 mb-4 sm:mt-4 sm:mb-8">
        <LanguageSwitcher compact />
      </div>

      <div className="w-full max-w-2xl">

        {activeView === "restore" ? (
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-8">
            <RestoreFromBackupStep onBack={() => setActiveView("setup")} />
          </div>
        ) : (
          <>
            {!needsBusinessType && (
            <div className="mb-8">
              <div className="flex justify-between items-center relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 md:h-3 rounded-full bg-gray-300 z-0" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 md:h-3 rounded-full bg-green-800 z-0 transition-all duration-300 left-0"
                  style={{ width: `${progressValue}%` }}
                />
                {[1, 2, 3, 4, 5].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`relative z-10 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base font-semibold transition-all ${stepNumber <= step ? "bg-green-800 text-white" : "bg-gray-300 text-gray-500"}`}
                  >
                    {stepNumber}
                  </div>
                ))}
              </div>
            </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-8">
              {step === 1 && (
              <BusinessTypeStep
                value={onboardingData.businessType}
                onChange={(businessType) => handleDataChange({ businessType })}
              />
              )}

              {step === 1 && setupStatus?.initialized === false && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setActiveView("restore")}
                  className="text-sm text-green-800 underline hover:text-green-900 cursor-pointer transition-colors"
                >
                  {onboardingTranslations("restore.toggleLink")}
                </button>
              </div>
              )}

              {step === 2 && (
              <UserAccountStep
                userAccountData={{
                  userName: onboardingData.userName,
                  userPassword: onboardingData.userPassword,
                  userPasswordConfirmation: onboardingData.userPasswordConfirmation,
                  userPin: onboardingData.userPin,
                }}
                onChange={(userData) => handleDataChange(userData)}
              />
              )}

              {step === 3 && (
              <BusinessDetailsStep
                businessData={{
                  businessType: onboardingData.businessType,
                  businessName: onboardingData.businessName,
                  businessAddress: onboardingData.businessAddress,
                  businessPhone: onboardingData.businessPhone,
                  businessEmail: onboardingData.businessEmail,
                  businessRFC: onboardingData.businessRFC,
                  businessCurrency: onboardingData.businessCurrency,
                  timezone: onboardingData.timezone,
                  businessLogo: onboardingData.businessLogo,
                }}
                onChange={(businessData) => handleDataChange(businessData)}
              />
              )}

              {step === 4 && (
              <WalletBackendStep
                walletBackendData={{
                  walletBackend: onboardingData.walletBackend,
                  nwcUri: onboardingData.nwcUri,
                  phoenixdRemote: onboardingData.phoenixdRemote,
                  phoenixdUrl: onboardingData.phoenixdUrl,
                  phoenixdPassword: onboardingData.phoenixdPassword,
                }}
                onChange={(walletData) => handleDataChange(walletData)}
              />
              )}

              {step === 5 && <WizardSummary onboardingData={onboardingData} onEdit={(stepNum) => setStep(stepNum)} />}

              <Divider className="hidden md:block my-8 bg-gray-400" />

              <div className="flex w-full mt-6 md:mt-0">
                {(!needsBusinessType && step !== 1) && (
                <Button
                  variant="bordered"
                  onPress={handlePrevious}
                  className="px-6 py-2 border border-border text-foreground hover:bg-muted transition-colors"
                >
                  {onboardingTranslations("buttons.back")}
                </Button>
                )}

                <div className="ml-auto">
                  {needsBusinessType ? (
                    <Button
                      color="primary"
                      onPress={handleComplete}
                      isDisabled={!onboardingData.businessType || isSubmittingSetup}
                      isLoading={isSubmittingSetup}
                      className="bg-green-800"
                    >
                      {onboardingTranslations("buttons.finish")}
                    </Button>
                  ) : step < 5 ? (
                    <Button
                      color="primary"
                      onPress={handleNext}
                      isDisabled={
                    (step === 1 && !onboardingData.businessType) ||
                    (step === 2 && (
                      !onboardingData.userName ||
                      !onboardingData.userPassword ||
                      !onboardingData.userPasswordConfirmation ||
                      onboardingData.userPassword !== onboardingData.userPasswordConfirmation ||
                      !isPasswordStrong(onboardingData.userPassword) ||
                      !isPinValid(onboardingData.userPin)
                    )) ||
                    (step === 3 && (!onboardingData.businessName || !onboardingData.businessCurrency || !onboardingData.timezone)) ||
                    (step === 4 && onboardingData.walletBackend === "nwc" && (!onboardingData.nwcUri || !NWC_URI_REGEX.test(onboardingData.nwcUri)))
                  }
                      className="bg-green-800"
                    >
                      {onboardingTranslations("buttons.next")}
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      onPress={handleComplete}
                      isDisabled={isSubmittingSetup}
                      isLoading={isSubmittingSetup}
                      className="bg-green-800"
                    >
                      {onboardingTranslations("buttons.finish")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
