import { useAtom } from "jotai";
import { useState, useEffect, SyntheticEvent, FormEvent } from "react";
import { useParams } from "react-router-dom";
import {
  Notification,
  Row,
  Col,
  Button,
  Icon,
} from "@canonical/react-components";

import ListingInputField from "./ListingInputField";

import { packageDataState } from "../../state/atoms";
import { capitalize } from "../../utils";

function Listing() {
  const { packageName } = useParams();
  const [packageData, setPackageData] = useAtom(packageDataState);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showSuccessNotification, setShowSuccessNotification] =
    useState<boolean>(false);
  const [showErrorNotification, setShowErrorNotification] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<{
    title: string | null;
    summary: string | null;
    website: string | undefined;
    contact: string | undefined;
  }>({
    title: null,
    summary: null,
    website: undefined,
    contact: undefined,
  });

  const defaultFormData = {
    title: packageData?.title || null,
    summary: packageData?.summary || null,
    website: packageData?.links?.website?.[0] || undefined,
    contact: packageData?.links?.contact?.[0] || undefined,
  };

  const handleInputChange = (
    e: SyntheticEvent<HTMLInputElement> & {
      target: HTMLInputElement;
    }
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isDisabled = () => {
    if (formData.title !== packageData?.title) {
      return false;
    }

    if (formData.summary !== packageData?.summary) {
      return false;
    }

    if (formData.website !== packageData?.links?.website?.[0]) {
      return false;
    }

    if (formData.contact !== packageData?.links?.contact?.[0]) {
      return false;
    }

    return true;
  };

  const getCharmIcon = () => {
    if (
      packageData &&
      packageData.media &&
      packageData.media.length &&
      packageData.media[0].url
    ) {
      return packageData?.media?.[0]?.url;
    }

    return "https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setShowSuccessNotification(false);
    setShowErrorNotification(false);
    setErrorMessage("");
    setIsSaving(true);

    const getLinks = (value: string | undefined) => {
      const trimmedValue = value?.trim();

      return trimmedValue ? [trimmedValue] : [];
    };

    if (
      formData.contact?.trim() &&
      !/^(https?:\/\/|mailto:)/i.test(formData.contact.trim())
    ) {
      setErrorMessage(
        "Contact must start with http://, https://, or mailto:"
      );
      setShowErrorNotification(true);
      setIsSaving(false);
      return;
    }

    if (
      formData.website?.trim() &&
      !/^https?:\/\//i.test(formData.website.trim())
    ) {
      setErrorMessage("Project homepage must start with http:// or https://");
      setShowErrorNotification(true);
      setIsSaving(false);
      return;
    }

    const payload = {
      title: formData.title || "",
      summary: formData.summary || "",
      links: {
        ...packageData?.links,
        website: getLinks(formData.website),
        contact: getLinks(formData.contact),
      },
    };

    let response;
    let data;

    try {
      response = await fetch(`/api/packages/${packageName}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": window.CSRF_TOKEN,
        },
        body: JSON.stringify(payload),
      });
      data = await response.json();
    } catch {
      setErrorMessage("Unable to save listing data. Please try again.");
      setShowErrorNotification(true);
      setIsSaving(false);
      return;
    }

    if (!response.ok || !data?.success) {
      setErrorMessage(
        data?.message || response.statusText || "Unable to save listing data."
      );
      setShowErrorNotification(true);
      setIsSaving(false);
      return;
    }

    setPackageData(data.data);

    setTimeout(() => {
      setShowSuccessNotification(true);
      setIsSaving(false);
    }, 500);
  };

  useEffect(() => {
    setFormData(defaultFormData);
  }, [packageData]);

  return (
    <form
      method="POST"
      className="p-form--stacked"
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      {packageData && packageData?.status !== "published" && (
        <Notification severity="caution">
          A published {packageData?.type} is required to successfully save this
          form.
        </Notification>
      )}

      <Row>
        <Col size={7}>
          <p>
            Updates to this information will appear immediately on the{" "}
            <a href={`/${packageName}`}>{packageData?.type} listing page</a>.
          </p>
        </Col>
        <Col size={5} className="u-align--right">
          <Button
            type="button"
            appearance="base"
            disabled={isDisabled()}
            onClick={() => {
              setFormData(defaultFormData);
            }}
          >
            Revert
          </Button>
          <Button
            type="submit"
            appearance="positive"
            className="is-dark"
            disabled={isSaving || isDisabled()}
          >
            {isSaving ? (
              <>
                <Icon name="spinner" className="u-animation--spin" />
                &nbsp;Saving...
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </Col>
      </Row>

      <hr className="u-no-margin--bottom" />

      {showSuccessNotification && (
        <Notification
          severity="positive"
          className="u-no-margin--bottom"
          onDismiss={() => {
            setShowSuccessNotification(false);
          }}
          role="alert"
          aria-live="polite"
        >
          {packageData?.name} has been updated successfully
        </Notification>
      )}

      {showErrorNotification && (
        <Notification
          severity="negative"
          className="u-no-margin--bottom"
          onDismiss={() => {
            setShowErrorNotification(false);
          }}
          role="alert"
          aria-live="polite"
        >
          {errorMessage
            ? errorMessage
            : `There was a problem updating ${packageData?.name}`}
        </Notification>
      )}

      <section className="p-strip is-shallow">
        <h2 className="p-heading--4">Listing details</h2>
        <Row className="p-form__group p-form-validation">
          <Col size={2}>
            <p>{capitalize(packageData?.type)} icon:</p>
          </Col>
          <Col size={8} className="col-x-large-6 u-sv2">
            <div className="p-form__control">
              <img
                src={getCharmIcon()}
                alt={`${packageName} icon`}
                width="48"
                height="48"
                className="p-media-object__image"
                style={{ borderRadius: "50%" }}
              />
            </div>
          </Col>
        </Row>

        <ListingInputField
          label="Title"
          name="title"
          maxLength={40}
          value={formData.title || undefined}
          handleInputChange={handleInputChange}
        />

        <ListingInputField
          label="Summary"
          name="summary"
          maxLength={100}
          value={formData.summary || undefined}
          handleInputChange={handleInputChange}
        />
      </section>

      <hr className="u-no-margin--bottom" />

      <section className="p-strip is-shallow">
        <h2 className="p-heading--4">Additional information</h2>

        <ListingInputField
          label="Project homepage"
          name="website"
          maxLength={256}
          value={formData.website}
          placeholder="https://charmhub.io"
          required={false}
          handleInputChange={handleInputChange}
        />

        <ListingInputField
          label="Contact"
          name="contact"
          maxLength={256}
          value={formData.contact}
          required={false}
          handleInputChange={handleInputChange}
        />
      </section>
    </form>
  );
}

export default Listing;
