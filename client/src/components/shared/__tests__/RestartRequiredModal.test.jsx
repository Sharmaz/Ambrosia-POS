import { render, screen, fireEvent, act } from "@testing-library/react";

import { RestartRequiredModal } from "../RestartRequiredModal";

jest.mock("@heroui/react", () => ({
  Modal: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
  ModalContent: ({ children }) => <div>{children}</div>,
  ModalHeader: ({ children }) => <div>{children}</div>,
  ModalBody: ({ children }) => <div>{children}</div>,
  ModalFooter: ({ children }) => <div>{children}</div>,
  Button: ({ onPress, children, ...props }) => (
    <button type="button" onClick={onPress} {...props}>{children}</button>
  ),
}));

describe("RestartRequiredModal", () => {
  it("renders nothing when closed", () => {
    render(<RestartRequiredModal isOpen={false} onAcknowledge={jest.fn()} />);
    expect(screen.queryByText("title")).not.toBeInTheDocument();
  });

  it("renders the title, description, and acknowledge button when open", () => {
    render(<RestartRequiredModal isOpen onAcknowledge={jest.fn()} />);
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
    expect(screen.getByText("acknowledgeButton")).toBeInTheDocument();
  });

  it("calls onAcknowledge when the acknowledge button is pressed", () => {
    const onAcknowledge = jest.fn();
    render(<RestartRequiredModal isOpen onAcknowledge={onAcknowledge} />);
    fireEvent.click(screen.getByText("acknowledgeButton"));
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
  });

  describe("countdown mode", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("renders the countdown description, seconds remaining, and restart-now button", () => {
      render(<RestartRequiredModal isOpen onAcknowledge={jest.fn()} countdownSeconds={5} />);
      expect(screen.getByText("countdownDescription")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("restartNowButton")).toBeInTheDocument();
    });

    it("counts down every second", () => {
      render(<RestartRequiredModal isOpen onAcknowledge={jest.fn()} countdownSeconds={5} />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("calls onAcknowledge automatically once the countdown reaches zero", () => {
      const onAcknowledge = jest.fn();
      render(<RestartRequiredModal isOpen onAcknowledge={onAcknowledge} countdownSeconds={1} />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(onAcknowledge).toHaveBeenCalledTimes(1);
    });

    it("calls onAcknowledge when the restart-now button is pressed before the countdown finishes", () => {
      const onAcknowledge = jest.fn();
      render(<RestartRequiredModal isOpen onAcknowledge={onAcknowledge} countdownSeconds={5} />);
      fireEvent.click(screen.getByText("restartNowButton"));
      expect(onAcknowledge).toHaveBeenCalledTimes(1);
    });

    it("does not render a countdown when countdownSeconds is not passed", () => {
      render(<RestartRequiredModal isOpen onAcknowledge={jest.fn()} />);
      expect(screen.queryByText("countdownDescription")).not.toBeInTheDocument();
      expect(screen.queryByText("restartNowButton")).not.toBeInTheDocument();
    });
  });
});
