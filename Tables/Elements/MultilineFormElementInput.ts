import { FormElement } from "core/modal_dialog_forms";

export class MultilineFormElementInput extends FormElement {
    placeholder: string;
    defaultValue: string;
    inputType: string;
    validator: Function;
    element: any;

    constructor({
        id,
        label = null,
        placeholder,
        defaultValue = "",
        inputType = "text",
        validator = null,
    }: any) {
        super(id, label);
        this.placeholder = placeholder;
        this.defaultValue = defaultValue;
        this.inputType = inputType;
        this.validator = validator;

        this.element = null;
    }

    override getHtml() {
        let classes = [];
        let inputType = "text";
        let maxlength = 256;
        switch (this.inputType) {
            case "text": {
                classes.push("input-text");
                break;
            }

            case "email": {
                classes.push("input-email");
                inputType = "email";
                break;
            }

            case "token": {
                classes.push("input-token");
                inputType = "text";
                maxlength = 4;
                break;
            }
        }

        return `
            <div class="formElement input mlei">
                ${this.label ? `<label>${this.label}</label>` : ""}
                <textarea 
                    type="${inputType}"
                    value="${this.defaultValue.replace(/["\\]+/gi, "")}"
                    maxlength="${maxlength}"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    class="${classes.join(" ")}"
                    placeholder="${this.placeholder.replace(/["\\]+/gi, "")}"
                    data-formId="${this.id}"></textarea>
            </div>
        `;
    }

    override bindEvents(parent: any, _clickTrackers: any) {
        this.element = this.getFormElement(parent);
        this.element.addEventListener("input", (_event: any) => this.updateErrorState());
        this.updateErrorState();
    }

    updateErrorState() {
        this.element.classList.toggle("erroredMLEI", !this.isValid());
    }

    override isValid() {
        return !this.validator || this.validator(this.element.value);
    }

    override getValue() {
        return this.element.value;
    }

    setValue(value: any) {
        this.element.value = value;
        this.updateErrorState();
    }

    override focus() {
        this.element.focus();
        this.element.select();
    }
}
