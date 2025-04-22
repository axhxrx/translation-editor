import { Accessor } from 'solid-js';

export type StatusBarProps = {
  totalChanges: Accessor<number>;
  shownChanges: Accessor<number>;
};

export const StatusBar = (props: StatusBarProps) => {
  const message = () => {
    const total = props.totalChanges();
    const shown = props.shownChanges();

    if (total === 0) {
      return 'Changes: 0';
    }
    if (shown === total) {
      return `Changes: ${total} (all shown)`;
    }
    if (shown === 0) {
      return `Changes: ${total} (hidden by filter)`;
    }
    // Otherwise, some are shown, some are hidden
    const hidden = total - shown;
    return `Changes: ${total} (${shown} shown, ${hidden} hidden by filter)`;
  };

  return <p>{message()}</p>;
};
