import {
  Children,
  FC,
  isValidElement,
  ReactNode,
  useCallback,
  useState,
} from 'react';

export type RenderSingleNode = (
  content: React.ReactNode,
  depth: number
) => React.ReactNode;
export type RenderMultipleNode = (
  content: React.ReactNode,
  children: React.ReactNode,
  depth: number,
  isExpanded: boolean,
  toggleExpand: () => void
) => React.ReactNode;

export interface TreeProps {
  children?: ReactNode;
  renderSingleNode?: RenderSingleNode;
  renderMultipleNode?: RenderMultipleNode;
  defaultExpanded?: boolean;
}

export interface TreeNodeProps {
  children?: ReactNode;
  defaultExpanded?: boolean;
}

interface InnerTreeNodeProps extends TreeNodeProps {
  depth: number;
  renderSingleNode: RenderSingleNode;
  renderMultipleNode: RenderMultipleNode;
}

const isComponentType = (element: any, componentType: any) => {
  return (
    element.type === componentType ||
    (typeof element.type === 'function' &&
      ((element.type as any).displayName === componentType.displayName ||
        (element.type as any).name === componentType.name ||
        (componentType.name &&
          (element.type as any).name === componentType.name)))
  );
};

export const Tree: FC<TreeProps> = (props) => {
  const { children, ...rest } = props;

  return (
    <div className="tree-container">
      {Children.map(children, (child, idx) => {
        if (isValidElement(child) && isComponentType(child, TreeNode)) {
          //@ts-ignore
          return <TreeNode {...child.props} key={idx} {...rest} />;
        } else {
          console.warn('`Tree` can only have `TreeNode` children', child);
        }
      })}
    </div>
  );
};

export const TreeNode: FC<TreeNodeProps> = (props) => {
  const {
    depth,
    children,
    defaultExpanded,
    renderSingleNode,
    renderMultipleNode,
  } = props as InnerTreeNodeProps;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || false);
  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const content = Children.toArray(children).filter(
    (child) => isValidElement(child) && isComponentType(child, TreeNodeContent)
  ) as React.ReactElement<any, string | React.JSXElementConstructor<any>>[];
  if (content.length > 1) {
    throw new Error('TreeNode can only have one TreeNodeContent child');
  }

  const childNodesWithProps = Children.toArray(children).reduce(
    (result, child) => {
      if (isValidElement(child) && isComponentType(child, TreeNode)) {
        result.push({
          ...child,
          props: {
            //@ts-ignore
            ...child.props,
            depth: (depth || 0) + 1,
            renderSingleNode,
            renderMultipleNode,
          },
        });
      }
      return result;
    },
    [] as any[]
  );

  return (
    <div className="tree-node-wrapper">
      {childNodesWithProps.length > 0 ? (
        <div className="tree-node tree-node-multiple">
          {renderMultipleNode(
            content[0]?.props.children,
            childNodesWithProps,
            depth,
            isExpanded,
            toggleExpand
          )}
        </div>
      ) : (
        <div className="tree-node tree-node-single">
          {renderSingleNode(content[0]?.props.children, depth)}
        </div>
      )}
    </div>
  );
};

export const TreeNodeContent: React.FC<{ children: ReactNode }> = ({
  children,
}) => <div className="tree-node-content">{children}</div>;

TreeNodeContent.displayName = 'TreeNodeContent';
TreeNode.displayName = 'TreeNode';
Tree.displayName = 'Tree';
