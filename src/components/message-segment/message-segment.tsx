import { Component, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'message-segment',
  styleUrl: 'message-segment.css',
  shadow: true,
})
export class MessageSegment {
  @Prop() segment: { message: string; condition?: string };
  @Prop() firstObject: any;
  @Prop() secondObject: any;
  @State() isEditMode: boolean = false;
  @State() values: { [key: string]: string } = {};
  @State() originalValues: { [key: string]: string } = {};

  componentWillLoad() {
    this.initializeValues();
  }

  initializeValues() {
    const message = this.segment.message;
    const regex = /\${(.*?)}/g;
    let match;
    while ((match = regex.exec(message)) !== null) {
      const key = match[1];
      const value = this.getValueForKey(key);
      this.values[key] = value;
      this.originalValues[key] = value;
      console.log(`Initialized ${key} with value: ${value}`); // Debugging statement
    }
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

  handleInputChange(event, key) {
    this.values = { ...this.values, [key]: event.target.value };
  }

  evaluateCondition(condition: string): boolean {
    try {
      return new Function('firstObject', 'secondObject', `return ${condition}`)(this.firstObject, this.secondObject);
    } catch (e) {
      console.error('Error evaluating condition:', e);
      return false;
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  renderMessage() {
    const message = this.segment.message;
    const regex = /\${(.*?)}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message)) !== null) {
      const key = match[1];
      parts.push(message.substring(lastIndex, match.index));
      parts.push(
        this.isEditMode ? (
          <input type="text" value={this.values[key]} onInput={(event) => this.handleInputChange(event, key)} />
        ) : (
          <span>{this.values[key]}</span>
        )
      );
      lastIndex = regex.lastIndex;
    }
    parts.push(message.substring(lastIndex));

    return parts;
  }

  render() {
    if (this.segment.condition && !this.evaluateCondition(this.segment.condition)) {
      return null;
    }

    return (
      <div class="segment" onClick={() => this.toggleEditMode()}>
        {this.renderMessage()}
      </div>
    );
  }
}
