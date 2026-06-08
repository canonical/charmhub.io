import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Strip,
  Row,
  Col,
  Button,
  MainTable,
  Notification,
  Pagination,
  Chip,
  Select,
  SearchBox,
} from "@canonical/react-components";

import type { InterfaceItem } from "../../types";

function sortInterfaces(a: InterfaceItem, b: InterfaceItem) {
  if (a?.status === "published" && b?.status !== "published") {
    return -1;
  }

  if (a?.status !== "published" && b?.status === "published") {
    return 1;
  }

  return 0;
}

const normalize = (value?: string) => (value || "").trim().toLowerCase();

type Props = {
  interfacesList: Array<InterfaceItem>;
};

const ITEMS_PER_PAGE = 10;

function InterfacesIndex({ interfacesList }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [interfaces, setInterfaces] = useState<Array<InterfaceItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const categoryFilter = searchParams.get("category") || "";

  const parsedPageNumber = Number.parseInt(searchParams.get("page") || "1", 10);
  const currentPageNumber =
    Number.isNaN(parsedPageNumber) || parsedPageNumber < 1
      ? 1
      : parsedPageNumber;

  const updateSearchParams = (
    updates: Record<string, string>,
    resetPage = true
  ) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (resetPage) {
      params.delete("page");
    }

    setSearchParams(params);
  };

  useEffect(() => {
    if (interfacesList) {
      setInterfaces(interfacesList);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch("./interfaces.json")
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }

        throw response;
      })
      .then((data) => {
        setInterfaces(data?.interfaces || []);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [interfacesList]);

  const sortedInterfaces = useMemo(
    () => [...interfaces].sort(sortInterfaces),
    [interfaces]
  );

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(
        sortedInterfaces.map((item) => normalize(item.status)).filter(Boolean)
      )
    ).sort();
  }, [sortedInterfaces]);

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(
        sortedInterfaces
          .flatMap((item) => item.tags || [])
          .map((tag) => normalize(tag))
          .filter(Boolean)
      )
    ).sort();
  }, [sortedInterfaces]);

  const statusSelectOptions = useMemo(
    () => [
      { value: "", label: "Status" },
      ...statusOptions.map((status) => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })),
    ],
    [statusOptions]
  );

  const categorySelectOptions = useMemo(
    () => [
      { value: "", label: "Category" },
      ...categoryOptions.map((category) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    ],
    [categoryOptions]
  );

  const filteredInterfaces = useMemo(() => {
    const normalizedSearch = normalize(searchQuery);
    const normalizedStatus = normalize(statusFilter);
    const normalizedCategory = normalize(categoryFilter);

    return sortedInterfaces.filter((item) => {
      const itemStatus = normalize(item.status);
      const itemTags = (item.tags || []).map((tag) => normalize(tag));
      const searchableText = [
        item.name,
        item.summary,
        item.description,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
        return false;
      }

      if (normalizedStatus && itemStatus !== normalizedStatus) {
        return false;
      }

      if (normalizedCategory && !itemTags.includes(normalizedCategory)) {
        return false;
      }

      return true;
    });
  }, [sortedInterfaces, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInterfaces.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(currentPageNumber, totalPages);
  const currentPageIndex = currentPage - 1;
  const startIndex = currentPageIndex * ITEMS_PER_PAGE;
  const currentItems = filteredInterfaces.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPageNumber > totalPages) {
      updateSearchParams(
        {
          page: totalPages > 1 ? totalPages.toString() : "",
        },
        false
      );
    }
  }, [currentPageNumber, totalPages]);

  useEffect(() => {
    document.title = "Charmhub | Interface catalogue";
  }, []);

  return (
    <>
      <Strip type="light">
        <Row>
          <Col size={4}>
            <h1>Interfaces</h1>
          </Col>
          <Col size={8}>
            <p>
              Interfaces describe the relation between two charms. This
              interface catalogue shows opinionated, standardized interface
              specifications for charm relations. Each interface outlines the
              behavior and requirements of charms relating to one another.
            </p>
            <p>
              Most of the content of these pages can be collaboratively
              discussed and changed. You can help us improve these pages by
              clicking the button below.
            </p>
            <p className="u-no-margin--bottom">
              <Button
                element="a"
                href="https://github.com/canonical/charm-relation-interfaces"
                appearance="positive"
              >
                Contribute
              </Button>
            </p>
          </Col>
        </Row>
      </Strip>
      <Strip>
        {error && (
          <Notification
            severity="negative"
            title="Error"
            onDismiss={() => {
              setError(false);
            }}
          >
            There was a problem fetching interfaces. Please try again in a few
            moments.
          </Notification>
        )}
        <Row>
          <Col size={5}>
            <SearchBox
              placeholder="Search interfaces"
              externallyControlled
              value={searchQuery}
              onChange={(value) => {
                updateSearchParams({ search: value });
              }}
              aria-label="Search interfaces"
            />
          </Col>
          <Col
            emptyLarge={9}
            size={4}
            className="p-form--inline"
            style={{ justifyContent: "flex-end" }}
          >
            <Select
              value={statusFilter}
              options={statusSelectOptions}
              onChange={(event) => {
                updateSearchParams({ status: event.target.value });
              }}
              aria-label="Status"
            />
            <Select
              value={categoryFilter}
              options={categorySelectOptions}
              onChange={(event) => {
                updateSearchParams({ category: event.target.value });
              }}
              aria-label="Category"
            />
          </Col>
        </Row>
        <MainTable
          headers={[
            {
              content: "Interface name",
              heading: "Interface name",
            },
            {
              content: "Status",
              heading: "Status",
              style: {
                width: "120px",
              },
            },
            {
              content: "Summary",
              heading: "Summary",
            },
            {
              content: "Category",
              heading: "Category",
            },
            {
              content: "Version",
              heading: "Version",
              style: {
                width: "80px",
              },
            },
            {
              content: "Links",
              heading: "Links",
            },
          ]}
          rows={currentItems.map((item: InterfaceItem) => {
            const interfaceName = item?.name || "";
            const interfaceStatus = item?.status || "";
            const libraryLink = item?.links?.library || "";
            const documentationLink = item?.links?.documentation || "";
            const normalizedInterfaceStatus = normalize(interfaceStatus);
            const interfaceStatusLabel = interfaceStatus
              ? interfaceStatus.charAt(0).toUpperCase() +
                interfaceStatus.slice(1)
              : "";
            const statusAppearance =
              normalizedInterfaceStatus === "published"
                ? "positive"
                : normalizedInterfaceStatus === "draft"
                  ? "caution"
                  : normalizedInterfaceStatus === "deprecated"
                    ? "negative"
                    : "information";

            return {
              columns: [
                {
                  content: (
                    <>
                      {interfaceName && (
                        <Link to={`/integrations/${interfaceName}`}>
                          {interfaceName}
                        </Link>
                      )}
                    </>
                  ),
                },
                {
                  content: (
                    <>
                      {interfaceStatus && (
                        <Chip
                          value={interfaceStatusLabel}
                          appearance={statusAppearance}
                          className="u-no-margin--bottom"
                          isReadOnly
                        />
                      )}
                    </>
                  ),
                },
                {
                  content: item?.summary || item?.description || "-",
                },
                {
                  content: (
                    <>
                      {item?.tags && item.tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {item.tags.map((tag) => (
                            <Chip
                              key={tag}
                              value={
                                tag
                                  ? tag.charAt(0).toUpperCase() + tag.slice(1)
                                  : ""
                              }
                              className="u-no-margin--bottom"
                              isReadOnly
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ),
                },
                {
                  content: item?.version?.toString() || "",
                },
                {
                  content: (
                    <>
                      {libraryLink && (
                        <>
                          <a
                            className="p-link--external"
                            href={libraryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Library
                          </a>
                          {documentationLink && <br />}
                        </>
                      )}
                      {documentationLink && (
                        <a
                          className="p-link--external"
                          href={documentationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Documentation
                        </a>
                      )}
                    </>
                  ),
                },
              ],
            };
          })}
          emptyStateMsg={`${
            loading ? "Fetching interfaces..." : "No interfaces available"
          }`}
          responsive
        />
        <div className="u-align--right">
          <Pagination
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            paginate={(pageNumber) => {
              updateSearchParams(
                { page: pageNumber > 1 ? pageNumber.toString() : "" },
                false
              );
            }}
            totalItems={filteredInterfaces.length}
          />
        </div>
        <p>
          {filteredInterfaces.length > ITEMS_PER_PAGE && (
            <>
              {startIndex + 1} &ndash; {startIndex + currentItems.length} of{" "}
              {filteredInterfaces.length} interfaces
            </>
          )}
        </p>
      </Strip>
    </>
  );
}

export default InterfacesIndex;
