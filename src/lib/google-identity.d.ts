export type CredentialResponse = {
  credential: string;
  select_by?: string;
};

export type PromptMomentNotification = {
  isDisplayMoment(): boolean;
  isDisplayed(): boolean;
  isNotDisplayed(): boolean;
  getNotDisplayedReason(): string;
  isSkippedMoment(): boolean;
  getSkippedReason(): string;
  isDismissedMoment(): boolean;
  getDismissedReason(): string;
  getMomentType(): string;
};

export type GsiButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string;
  locale?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
            auto_select?: boolean;
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean;
          }): void;
          prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
          renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
          disableAutoSelect(): void;
        };
      };
    };
  }
}

export {};
