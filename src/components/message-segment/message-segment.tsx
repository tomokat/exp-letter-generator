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

  render() {
    if (this.segment.condition && !this.evaluateCondition(this.segment.condition)) {
      return null;
    }

    const message = this.segment.message
      .replace('${name}', this.firstObject.name)
      .replace('${refId}', this.firstObject.refId)
      .replace('${reason}', this.secondObject.reason);

    return (
      <div class="segment" onClick={() => this.toggleEditMode()}>
        {this.isEditMode ? (
          <textarea>{message}</textarea>
        ) : (
          <p>{message}</p>
        )}
      </div>
    );
  }
}
