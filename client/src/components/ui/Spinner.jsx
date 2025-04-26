import * as React from 'react';
// import classNames from 'classnames';

const Spinner = React.forwardRef(({
  className,
  children,
  loading = true,
  size = '2',
  style,
  ...props
}, forwardedRef) => {
  if (!loading) return children;

  // Size mapping
  const sizeStyles = {
    '1': { width: 'var(--space-3)', height: 'var(--space-3)' },
    '2': { width: 'var(--space-4)', height: 'var(--space-4)' },
    '3': { width: 'calc(1.25 * var(--space-4))', height: 'calc(1.25 * var(--space-4))' }
  };

  // Base spinner styles
  const spinnerStyle = {
    display: 'block',
    position: 'relative',
    opacity: 'var(--spinner-opacity, 0.65)',
    ...sizeStyles[size],
    ...style
  };

  // Leaf animation
  const leafAnimation = {
    animationName: 'rt-spinner-leaf-fade',
    animationDuration: 'var(--spinner-animation-duration, 800ms)',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite'
  };

  // Leaf styles
  const leafStyle = {
    position: 'absolute',
    top: 0,
    left: 'calc(50% - 12.5% / 2)',
    width: '12.5%',
    height: '100%',
    ...leafAnimation
  };

  // Leaf before pseudo-element
  const leafBeforeStyle = {
    content: '""',
    display: 'block',
    width: '100%',
    height: '30%',
    borderRadius: 'var(--radius-1)',
    backgroundColor: 'currentColor'
  };

  // Rotation delays for each leaf
  const leafRotations = [
    { transform: 'rotate(0deg)', animationDelay: 'calc(-8 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(45deg)', animationDelay: 'calc(-7 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(90deg)', animationDelay: 'calc(-6 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(135deg)', animationDelay: 'calc(-5 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(180deg)', animationDelay: 'calc(-4 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(225deg)', animationDelay: 'calc(-3 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(270deg)', animationDelay: 'calc(-2 / 8 * var(--spinner-animation-duration, 800ms))' },
    { transform: 'rotate(315deg)', animationDelay: 'calc(-1 / 8 * var(--spinner-animation-duration, 800ms))' }
  ];

  const spinner = (
    <span 
      {...props}
      ref={forwardedRef}
      className='rt-Spinner'
      style={spinnerStyle}
    >
      {leafRotations.map((rotation, index) => (
        <span 
          key={index}
          className="rt-SpinnerLeaf"
          style={{ ...leafStyle, ...rotation }}
        >
          <span style={leafBeforeStyle} />
        </span>
      ))}
    </span>
  );

  if (children === undefined) return spinner;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        display: 'contents', 
        visibility: 'hidden',
        ariaHidden: true
      }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {spinner}
      </div>
    </div>
  );
});

// Define the keyframes globally (should be added to your global styles)
const spinnerKeyframes = `
  @keyframes rt-spinner-leaf-fade {
    from { opacity: 1; }
    to { opacity: 0.25; }
  }
`;

// You would need to inject these keyframes into the document head
// This should be done once when your app loads
if (typeof document !== 'undefined' && !document.getElementById('spinner-keyframes')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'spinner-keyframes';
  styleTag.innerHTML = spinnerKeyframes;
  document.head.appendChild(styleTag);
}

Spinner.displayName = 'Spinner';

export { Spinner };