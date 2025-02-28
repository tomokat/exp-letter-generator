import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'main-render',
  styleUrl: './main-render.css',
  shadow: true,
})
export class MainRender {
  @State() firstObject = { name: 'John Doe', refId: 123, type: 'claim', urgency: 'high' };
  @State() secondObject = { id: 456, amount: 1000, status: 'stop', reason: 'missing information' };
  @State() segments = [
    { message: 'Hello ${firstObject.name},' },
    { message: 'With regards to your ${firstObject.refId} of your ${firstObject.type}' },
    { message: 'We will be shortly reaching out to you', condition: "firstObject.type === 'claim' && secondObject.status === 'proceed'" },
    { message: 'We are sorry to inform you that we cannot process your claim due to ${secondObject.reason}', condition: "firstObject.type === 'claim' && secondObject.status === 'stop'" },
    { message: 'We would like to inform you that your ${firstObject.refId} is in process', condition: "firstObject.type === 'normal'" },
    { message: 'We want to let you know this great opportunity with you today', condition: "firstObject.type === 'review'" },
    { message: 'Thank you for your time' }
  ];

  render() {
    if (!this.firstObject || !this.secondObject) {
      return null;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {this.segments.map(segment => (
          <div>
            <message-segment segment={segment} firstObject={this.firstObject} secondObject={this.secondObject}></message-segment>
          </div>
        ))}
      </div>
    );
  }
}
