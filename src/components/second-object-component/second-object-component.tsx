import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'second-object-component',
  styleUrl: 'second-object-component.css',
  shadow: true,
})
export class SecondObjectComponent {
  @Prop() secondObject: { id: number; amount: number; status: 'proceed' | 'stop' | 'review'; reason: 'missing' | 'invalid' | 'duplicate' };

  render() {
    if (!this.secondObject) {
      return null;
    }

    return (
      <div>
        <p>ID: {this.secondObject.id}</p>
        <p>Amount: {this.secondObject.amount}</p>
        <p>Status: {this.secondObject.status}</p>
        <p>Reason: {this.secondObject.reason}</p>
      </div>
    );
  }
}
