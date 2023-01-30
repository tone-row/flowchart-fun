import { MouseEventHandler, TouchEventHandler } from "react";

const longPressDuration = 610;
export class ContextMenuHandler {
  private callback: (event: any) => void;
  private longPressCountdown: any;

  constructor(callback: (event: any) => void) {
    this.callback = callback;
    this.longPressCountdown = null;
  }

  onTouchStart: TouchEventHandler = (e) => {
    const touch = e.touches[0];

    this.longPressCountdown = setTimeout(() => {
      this.callback(touch);
    }, longPressDuration);
  };

  onTouchMove: TouchEventHandler = (e) => {
    clearTimeout(this.longPressCountdown);
  };

  onTouchCancel: TouchEventHandler = (e) => {
    clearTimeout(this.longPressCountdown);
  };

  onTouchEnd: TouchEventHandler = (e) => {
    clearTimeout(this.longPressCountdown);
  };

  onContextMenu: MouseEventHandler = (e) => {
    clearTimeout(this.longPressCountdown);

    this.callback(e);
    e.preventDefault();
  };
}
