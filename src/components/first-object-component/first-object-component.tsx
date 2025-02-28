import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'first-object-component',
  styleUrl: 'first-object-component.css',
  shadow: true,
})
export class FirstObjectComponent {
  @Prop() firstObject: { name: string; refId: number; type: 'claim' | 'normal' | 'promotion'; urgency: 'high' | 'medium' | 'low' };

  render() {
    if (!this.firstObject) {
      return null;
    }

    return (
      <div>
        <p>Name: {this.firstObject.name}</p>
        <p>Ref ID: {this.firstObject.refId}</p>
        <p>Type: {this.firstObject.type}</p>
        <p>Urgency: {this.firstObject.urgency}</p>
      </div>
    );
  }
}
