import { Component, Prop, State, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'message-segment',
  styleUrl: 'message-segment.css',
  shadow: true,
})
export class MessageSegment {
  @Prop() segment: { message: string; fr_message: string; condition?: string; draggable?: boolean; removable?: boolean };
  @Prop() firstObject: any;
  @Prop() secondObject: any;
  @Prop() index: number;
  @Prop() values: { [key: string]: string };
  @Prop() type: 'main' | 'additional';
  @State() isEditMode: boolean = false;

  @Event() segmentDragStart: EventEmitter<number>;
  @Event() segmentDrop: EventEmitter<{ fromIndex: number; toIndex: number }>;
  @Event() inputChange: EventEmitter<{ key: string; value: string }>;
  @Event() deleteSegment: EventEmitter<number>;

  handleInputChange(event, key) {
    this.inputChange.emit({ key, value: event.target.value });
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.toggleEditMode();
    }
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
    if (this.type === 'main') {
      this.isEditMode = !this.isEditMode;
    }
  }

  handleDragStart(event) {
    //const type = this.type;
    //event.dataTransfer.setData('text/plain', JSON.stringify({ type, index: this.index }));
    event.dataTransfer.setData('text/plain', this.index.toString());
    this.segmentDragStart.emit(this.index);
  }

  handleDrop(event) {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    const toIndex = this.index;
    console.log('Drop:', fromIndex, toIndex);
    this.segmentDrop.emit({ fromIndex, toIndex });
  }

  handleDragOver(event) {
    event.preventDefault();
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  handleDelete() {
    this.deleteSegment.emit(this.index);
  }

  getMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    return lang === 'fr' ? this.segment.fr_message : this.segment.message;
  }

  renderMessage() {
    const message = this.getMessage();
    const regex = /\${(.*?)}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message)) !== null) {
      const key = match[1];
      const value = this.values[key] || this.getValueForKey(key);
      parts.push(message.substring(lastIndex, match.index));
      parts.push(
        this.isEditMode ? (
          <input type="text" value={value} 
            onInput={(event) => this.handleInputChange(event, key)}
            onClick={(event) => this.stopPropagation(event)}
            onKeyDown={(event) => this.handleKeyDown(event)}
            onFocus={(event) => (event.target as HTMLInputElement).select()} />
        ) : (
          <span>{value}</span>
        )
      );
      lastIndex = regex.lastIndex;
    }
    parts.push(message.substring(lastIndex));

    return parts;
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

  render() {
    if (this.segment.condition && !this.evaluateCondition(this.segment.condition)) {
      return null;
    }

    const segmentClass = this.segment.draggable ? 'segment' : 'segment fixed';

    return (
      <div
        class={segmentClass}
        onClick={() => this.toggleEditMode()}
        draggable={this.segment.draggable}
        onDragStart={(event) => this.handleDragStart(event)}
        onDrop={(event) => this.handleDrop(event)}
        onDragOver={(event) => this.handleDragOver(event)}
        data-index={this.index}
        style={{ width: '100%' }}
      >
        <div class="segment-content">
          {this.renderMessage()}
        </div>
        {this.isEditMode && this.segment.removable && (
          <div class="segment-delete">
            <button class="delete-button" onClick={(event) => { event.stopPropagation(); this.handleDelete(); }}>
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }
}
