import { Row, Col } from "@canonical/react-components";
import { SyntheticEvent } from "react";

export type ListingInputFieldProps = {
  label: string;
  name: string;
  value: string | undefined;
  helpText?: string;
  maxLength?: number;
  placeholder?: string;
  handleInputChange: (
    e: SyntheticEvent<HTMLInputElement> & {
      target: HTMLInputElement;
    }
  ) => void;
};

function ListingInputField({
  label,
  name,
  value,
  helpText,
  maxLength,
  placeholder,
  handleInputChange,
}: ListingInputFieldProps) {
  return (
    <Row className="p-form__group p-form-validation">
      <Col size={2}>
        <label htmlFor={name}>{label}:</label>
      </Col>
      <Col size={8} className="col-x-large-6">
        <div className="p-form__control">
          <input
            type="text"
            className="p-form-validation__input"
            id={name}
            name={name}
            required
            maxLength={maxLength}
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => {
              handleInputChange(e);
            }}
          />
          {helpText && <p className="p-form-help-text">{helpText}</p>}
        </div>
      </Col>
    </Row>
  );
}

export default ListingInputField;
