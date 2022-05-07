import {
  default as React,
} from 'react';

export default function (props) {
  return <>
    <div
      style={{
        backgroundColor: '#9e2315',
        minHeight: '400px',
        padding: '10px',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  </>
}
