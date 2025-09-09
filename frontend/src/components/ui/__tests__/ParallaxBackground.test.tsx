import React from 'react';
import { render, screen } from '@testing-library/react';
import { ParallaxBackground, FloatingElement } from '../ParallaxBackground';

// Mock the useParallax hook
jest.mock('../../../hooks/useParallax', () => ({
  useParallax: jest.fn(() => ({
    ref: { current: null },
    transform: 'translate3d(0, 10px, 0)',
  })),
}));

describe('ParallaxBackground', () => {
  it('should render children correctly', () => {
    render(
      <ParallaxBackground>
        <div data-testid="child-element">Test Content</div>
      </ParallaxBackground>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply transform style from useParallax hook', () => {
    const { container } = render(
      <ParallaxBackground>
        <div>Content</div>
      </ParallaxBackground>
    );

    const parallaxElement = container.firstChild as HTMLElement;
    expect(parallaxElement).toHaveStyle('transform: translate3d(0, 10px, 0)');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ParallaxBackground className="custom-class">
        <div>Content</div>
      </ParallaxBackground>
    );

    const parallaxElement = container.firstChild as HTMLElement;
    expect(parallaxElement).toHaveClass('custom-class');
    expect(parallaxElement).toHaveClass('absolute');
    expect(parallaxElement).toHaveClass('inset-0');
    expect(parallaxElement).toHaveClass('will-change-transform');
  });

  it('should pass correct props to useParallax hook', () => {
    const useParallaxMock = require('../../../hooks/useParallax').useParallax;
    
    render(
      <ParallaxBackground 
        speed={0.8} 
        direction="down" 
        disabled={true}
      >
        <div>Content</div>
      </ParallaxBackground>
    );

    expect(useParallaxMock).toHaveBeenCalledWith({
      speed: 0.8,
      direction: 'down',
      disabled: true,
    });
  });

  it('should use default props when not provided', () => {
    const useParallaxMock = require('../../../hooks/useParallax').useParallax;
    
    render(
      <ParallaxBackground>
        <div>Content</div>
      </ParallaxBackground>
    );

    expect(useParallaxMock).toHaveBeenCalledWith({
      speed: 0.5,
      direction: 'up',
      disabled: false,
    });
  });
});

describe('FloatingElement', () => {
  it('should render children correctly', () => {
    render(
      <FloatingElement>
        <div data-testid="floating-child">Floating Content</div>
      </FloatingElement>
    );

    expect(screen.getByTestId('floating-child')).toBeInTheDocument();
    expect(screen.getByText('Floating Content')).toBeInTheDocument();
  });

  it('should apply transform and custom styles', () => {
    const customStyle = { backgroundColor: 'red', zIndex: 10 };
    
    const { container } = render(
      <FloatingElement style={customStyle}>
        <div>Content</div>
      </FloatingElement>
    );

    const floatingElement = container.firstChild as HTMLElement;
    expect(floatingElement).toHaveStyle('transform: translate3d(0, 10px, 0)');
    expect(floatingElement).toHaveStyle('background-color: red');
    expect(floatingElement).toHaveStyle('z-index: 10');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FloatingElement className="floating-custom">
        <div>Content</div>
      </FloatingElement>
    );

    const floatingElement = container.firstChild as HTMLElement;
    expect(floatingElement).toHaveClass('floating-custom');
    expect(floatingElement).toHaveClass('absolute');
    expect(floatingElement).toHaveClass('will-change-transform');
  });

  it('should pass correct props to useParallax hook', () => {
    const useParallaxMock = require('../../../hooks/useParallax').useParallax;
    
    render(
      <FloatingElement 
        speed={0.6} 
        direction="left"
      >
        <div>Content</div>
      </FloatingElement>
    );

    expect(useParallaxMock).toHaveBeenCalledWith({
      speed: 0.6,
      direction: 'left',
    });
  });

  it('should use default props when not provided', () => {
    const useParallaxMock = require('../../../hooks/useParallax').useParallax;
    
    render(
      <FloatingElement>
        <div>Content</div>
      </FloatingElement>
    );

    expect(useParallaxMock).toHaveBeenCalledWith({
      speed: 0.3,
      direction: 'up',
    });
  });

  it('should render without children', () => {
    const { container } = render(
      <FloatingElement className="empty-floating" />
    );

    const floatingElement = container.firstChild as HTMLElement;
    expect(floatingElement).toHaveClass('empty-floating');
    expect(floatingElement).toBeEmptyDOMElement();
  });
});