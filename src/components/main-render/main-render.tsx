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
    { message: 'Hello ${firstObject.name},', fr_message: 'Bonjour ${firstObject.name},', draggable: false, removable: false },
    { message: 'With regards to your ${firstObject.refId} of your ${firstObject.type}', fr_message: 'En ce qui concerne votre ${firstObject.refId} de votre ${firstObject.type}', draggable: true, removable: true },
    { message: 'We will be shortly reaching out to you', fr_message: 'Nous vous contacterons sous peu', condition: "firstObject.type === 'claim' && secondObject.status === 'proceed'", draggable: true, removable: true },
    { message: 'We are sorry to inform you that we cannot process your claim due to ${secondObject.reason}', fr_message: 'Nous sommes désolés de vous informer que nous ne pouvons pas traiter votre réclamation en raison de ${secondObject.reason}', condition: "firstObject.type === 'claim' && secondObject.status === 'stop'", draggable: true, removable: true },
    { message: 'Please send us copy of receipt matching your purchase amount of $${secondObject.amount} and we will process your claim as quickly as we can', fr_message: 'Veuillez nous envoyer une copie du reçu correspondant à votre montant d\'achat de $${secondObject.amount} et nous traiterons votre réclamation dès que possible', condition: "firstObject.type === 'claim' && secondObject.status === 'stop'", draggable: true, removable: true },
    { message: 'We would like to inform you that your ${firstObject.refId} is in process', fr_message: 'Nous souhaitons vous informer que votre ${firstObject.refId} est en cours de traitement', condition: "firstObject.type === 'normal'", draggable: true, removable: true },
    { message: 'We want to let you know this great opportunity with you today', fr_message: 'Nous voulons vous faire part de cette grande opportunité aujourd\'hui', condition: "firstObject.type === 'review'", draggable: true, removable: true },
    { message: 'Thank you for your time', fr_message: 'Merci pour votre temps', draggable: false, removable: false }
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

  handleDeleteSegment(index) {
    const segments = [...this.segments];
    const values = [...this.values];
    segments.splice(index, 1);
    values.splice(index, 1);
    this.segments = segments;
    this.values = values;
  }

  render() {
    if (!this.firstObject || !this.secondObject) {
      return null;
    }

    return (
      <div class="container">
        <div class="column">
          {this.segments.map((segment, index) => (
            <div class="segment-container">
              <message-segment
                segment={segment}
                firstObject={this.firstObject}
                secondObject={this.secondObject}
                index={index}
                values={this.values[index]}
                onSegmentDragStart={(event) => this.handleSegmentDragStart(event)}
                onSegmentDrop={(event) => this.handleSegmentDrop(event)}
                onInputChange={(event) => this.handleInputChange(index, event.detail.key, event.detail.value)}
                onDeleteSegment={(event) => this.handleDeleteSegment(event.detail)}
              ></message-segment>
            </div>
          ))}
        </div>
        <div class="column">
          <preview-render segments={this.segments} firstObject={this.firstObject} secondObject={this.secondObject} values={this.values}></preview-render>
        </div>
      </div>
    );
  }
}
