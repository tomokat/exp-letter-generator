import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'main-render',
  styleUrl: './main-render.css',
  shadow: true,
})
export class MainRender {
  @State() firstObject = { name: 'John Doe', refId: 123, type: 'claim', urgency: 'high', severity: 'critical' };
  @State() secondObject = { id: 456, amount: 1000, status: 'stop', reason: 'missing information', processTime: 3};
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
  @State() additionalSegments = [
    { message: 'If you want us to email a copy, please let us know', fr_message: 'Si vous souhaitez que nous envoyions une copie par e-mail, veuillez nous le faire savoir', draggable: true, removable: true },
    { message: 'For your ${firstObject.urgency} request, we would process it shortly', fr_message: 'Pour votre demande ${firstObject.urgency}, nous la traiterons sous peu', draggable: true, removable: true },
    { message: 'For your case since amount of ${secondObject.amount} is below threshold, we would not process your request', fr_message: 'Pour votre cas, puisque le montant de ${secondObject.amount} est inférieur au seuil, nous ne traiterons pas votre demande', draggable: true, removable: true },
    { message: 'Estimated processing time of your order will be ${secondObject.processTime}', fr_message: 'Le délai de traitement estimé de votre commande sera de ${secondObject.processTime}', draggable: true, removable: true },
    { message: 'For your ${firstObject.severity} request, we are sorry for taking long time to get back to you', fr_message: 'Pour votre demande ${firstObject.severity}, nous sommes désolés de prendre autant de temps pour vous répondre', draggable: true, removable: true }
  ];
  @State() values: { [key: string]: string }[] = [];
  @State() valuesForAdditionalSegments: { [key: string]: string }[] = [];
  @State() isExpanded: boolean = true;

  componentWillLoad() {
    this.initializeValues();
  }

  initializeValues() {
    this.values = this.segments.map(segment => this.extractValues(segment.message));
    this.valuesForAdditionalSegments = this.additionalSegments.map(segment => this.extractValues(segment.message));
  }

  extractValues(message: string): { [key: string]: string } {
    const regex = /\${(.*?)}/g;
    const values = {};
    let match;
    while ((match = regex.exec(message)) !== null) {
      const key = match[1];
      values[key] = this.getValueForKey(key);
    }
    return values;
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
    //if (!event.target.draggable) return;
    //event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'main', index: event.detail }));
    console.log('Drag start:', event.detail);
  }

  handleSegmentDrop(event) {
    //const { type, index: fromIndex } = JSON.parse(event.dataTransfer.getData('text/plain'));
    //if (type !== 'main') return;
    const { fromIndex, toIndex } = event.detail;
    //const toIndex = event.detail.toIndex;
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

  handleAdditionalSegmentDrop(event) {
    const { type, index: fromIndex } = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (type !== 'additional') return;

    const additionalSegment = this.additionalSegments[fromIndex];
    const segments = [...this.segments, additionalSegment];
    const values = [...this.values, this.valuesForAdditionalSegments[fromIndex]];
    this.segments = segments;
    this.values = values;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  render() {
    if (!this.firstObject || !this.secondObject) {
      return null;
    }

    return (
      <div class="container">
        <div class={`column ${this.isExpanded ? 'expanded' : 'collapsed'}`}>
          <button class="toggle-button" onClick={() => this.toggleExpand()}>
            {this.isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {this.isExpanded && (
            <div>
              {this.additionalSegments.map((segment, index) => (
                <div class="segment-container">
                  <message-segment
                    segment={segment}
                    firstObject={this.firstObject}
                    secondObject={this.secondObject}
                    index={index}
                    values={this.valuesForAdditionalSegments[index]}
                    type="additional"
                    onSegmentDragStart={(event) => this.handleSegmentDragStart(event)}
                  ></message-segment>
                </div>
              ))}
            </div>
          )}
        </div>
        <div class="column main-column" onDrop={(event) => this.handleAdditionalSegmentDrop(event)} onDragOver={(event) => event.preventDefault()}>
          {this.segments.map((segment, index) => (
            <div class="segment-container">
              <message-segment
                segment={segment}
                firstObject={this.firstObject}
                secondObject={this.secondObject}
                index={index}
                values={this.values[index]}
                type="main"
                onSegmentDragStart={(event) => this.handleSegmentDragStart(event)}
                onSegmentDrop={(event) => this.handleSegmentDrop(event)}
                onInputChange={(event) => this.handleInputChange(index, event.detail.key, event.detail.value)}
                onDeleteSegment={(event) => this.handleDeleteSegment(event.detail)}
              ></message-segment>
            </div>
          ))}
        </div>
        <div class="column preview-column">
          <preview-render segments={this.segments} firstObject={this.firstObject} secondObject={this.secondObject} values={this.values}></preview-render>
        </div>
      </div>
    );
  }
}
