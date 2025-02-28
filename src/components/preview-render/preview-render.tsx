import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'preview-render',
  styleUrl: 'preview-render.css',
  shadow: true,
})
export class PreviewRender {
  @Prop() segments: { message: string; fr_message: string; condition?: string; draggable?: boolean }[];
  @Prop() firstObject: any;
  @Prop() secondObject: any;
  @Prop() values: { [key: string]: string }[];

  evaluateCondition(condition: string): boolean {
    try {
      return new Function('firstObject', 'secondObject', `return ${condition}`)(this.firstObject, this.secondObject);
    } catch (e) {
      console.error('Error evaluating condition:', e);
      return false;
    }
  }

  getMessage(segment) {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    return lang === 'fr' ? segment.fr_message : segment.message;
  }

  renderMessage(segment, index) {
    const message = this.getMessage(segment);
    const regex = /\${(.*?)}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message)) !== null) {
      const key = match[1];
      const value = this.values[index][key];
      parts.push(message.substring(lastIndex, match.index));
      parts.push(<span>{value}</span>);
      lastIndex = regex.lastIndex;
    }
    parts.push(message.substring(lastIndex));

    return parts;
  }

  render() {
    return (
      <div>
        {this.segments.map((segment, index) => {
          if (segment.condition && !this.evaluateCondition(segment.condition)) {
            return null;
          }
          return (
            <div>
              {this.renderMessage(segment, index)}
              <br /><br />
            </div>
          );
        })}
      </div>
    );
  }
}
