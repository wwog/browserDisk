import { FC, type ReactNode } from 'react';
import { Close } from '../../../../components/Icons';
import { useAppService } from '../../../../hooks/useAppService';

interface SelectorItemProps {
  children?: ReactNode;
  active?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}
export const SelectorItem: FC<SelectorItemProps> = (props) => {
  const { active, children, onClose, onClick } = props;
  return (
    <div
      className={'selector-item' + (active ? ' item-active' : '')}
      onClick={onClick}
    >
      <div className="item-content">
        <div>{children}</div>
        {onClose && (
          <Close
            className="item-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export const ApplicationSelector: FC = () => {
  const { opened, appService } = useAppService();
  return (
    <div className="app-selector">
      {opened.map((item) => (
        <SelectorItem
          key={item.id}
          active={item.active}
          onClick={() => {
            appService.changeActiveApp(item.id);
          }}
          onClose={() => {
            appService.closeApp(item.id);
          }}
        >
          {item.showName}
        </SelectorItem>
      ))}
    </div>
  );
};
