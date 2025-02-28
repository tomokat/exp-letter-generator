import { Component, Prop, State, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'message-segment',
  styleUrl: 'message-segment.css',
  shadow: true,
})
export class MessageSegment {
  @Prop() segment: { message: string; condition?: string; draggable?: boolean; removable?: boolean };
  @Prop() firstObject: any;
  @Prop() secondObject: any;
  @Prop() index: number;
  @Prop() values: { [key: string]: string };
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
    this.isEditMode = !this.isEditMode;
  }

  handleDragStart(event) {
    event.dataTransfer.setData('text/plain', this.index.toString());
    this.segmentDragStart.emit(this.index);
  }

  handleDrop(event) {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    const toIndex = this.index;
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
          <input type="text" value={this.values[key]} onInput={(event) => this.handleInputChange(event, key)} onClick={(event) => this.stopPropagation(event)} onKeyDown={(event) => this.handleKeyDown(event)} />
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
