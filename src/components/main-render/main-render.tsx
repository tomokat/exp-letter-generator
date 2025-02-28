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
    { message: 'Hello ${firstObject.name},', draggable: false },
    { message: 'With regards to your ${firstObject.refId} of your ${firstObject.type}', draggable: true },
    { message: 'We will be shortly reaching out to you', condition: "firstObject.type === 'claim' && secondObject.status === 'proceed'", draggable: true },
    { message: 'We are sorry to inform you that we cannot process your claim due to ${secondObject.reason}', condition: "firstObject.type === 'claim' && secondObject.status === 'stop'", draggable: true },
    { message: 'Please send us copy of receipt matching your purchase amount of $${secondObject.amount} and we will process your claim as quickly as we can', condition: "firstObject.type === 'claim' && secondObject.status === 'stop'", draggable: true },
    { message: 'We would like to inform you that your ${firstObject.refId} is in process', condition: "firstObject.type === 'normal'", draggable: true },
    { message: 'We want to let you know this great opportunity with you today', condition: "firstObject.type === 'review'", draggable: true },
    { message: 'Thank you for your time', draggable: false }
  ];
  @State() values: { [key: string]: string }[] = [];

  componentWillLoad() {
    this.initializeValues();
  }

  initializeValues() {
    this.values = this.segments.map(segment => {
      const message = segment.message;
      const regex = /\${(.*?)}/g;
      const values = {};
      let match;
      while ((match = regex.exec(message)) !== null) {
        const key = match[1];
        values[key] = this.getValueForKey(key);
      }
      return values;
    });
  }

  getValueForKey(key: string): string {
    const [objectName, propertyName] = key.split('.');
    if (objectName === 'firstObject') {
      return this.firstObject[propertyName];
    } else if (objectName === 'secondObject') {
      return this.secondObject[propertyName];
    }
    return '';
  }

  handleSegmentDragStart(event) {
    console.log('Drag start:', event.detail);
  }

  handleSegmentDrop(event) {
    const { fromIndex, toIndex } = event.detail;
    const segments = [...this.segments];
    const values = [...this.values];
    const [movedSegment] = segments.splice(fromIndex, 1);
    const [movedValues] = values.splice(fromIndex, 1);
    segments.splice(toIndex, 0, movedSegment);
    values.splice(toIndex, 0, movedValues);
    this.segments = segments;
    this.values = values;
  }

  handleInputChange(index, key, value) {
    const values = [...this.values];
    values[index] = { ...values[index], [key]: value };
    this.values = values;
  }

  render() {
    if (!this.firstObject || !this.secondObject) {
      return null;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {this.segments.map((segment, index) => (
          <div>
            <message-segment
              segment={segment}
              firstObject={this.firstObject}
              secondObject={this.secondObject}
              index={index}
              values={this.values[index]}
              onSegmentDragStart={(event) => this.handleSegmentDragStart(event)}
              onSegmentDrop={(event) => this.handleSegmentDrop(event)}
              onInputChange={(event) => this.handleInputChange(index, event.detail.key, event.detail.value)}
            ></message-segment>
          </div>
        ))}
      </div>
    );
  }
}
