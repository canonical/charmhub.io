import { useEffect, useRef, useState } from "react";
import { Col, Row, Strip } from "@canonical/react-components";
import { CharmCard, LoadingCard } from "@canonical/store-components";
import { useQuery } from "react-query";

import { Store } from "../../types";
import Banner from "../Banner";

const FEATURED_CHARM_COUNT = 12;
const FEATURED_SOLUTION_COUNT = 4;

type Solution = {
  categories: Array<string | { display_name?: string; name?: string }>;
  icon: string | null;
  last_updated: string | null;
  name: string;
  platform: string;
  publisher: string;
  summary: string;
  title: string;
};

type Props = {
  data?: Store;
  isFetching: boolean;
  status: "success" | "idle" | "error" | "loading";
};

export const LandingPage = ({ data, isFetching, status }: Props) => {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [activeSection, setActiveSection] = useState<"solutions" | "charms">(
    "solutions"
  );
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  useEffect(() => {
    const sections = [
      document.getElementById("discover-solutions"),
      document.getElementById("explore-charms"),
    ].filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.find((entry) => entry.isIntersecting);

        if (activeEntry) {
          setActiveSection(
            activeEntry.target.id === "explore-charms" ? "charms" : "solutions"
          );
        }
      },
      { rootMargin: "-5% 0px -87% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const { data: solutionsData, isFetching: areSolutionsFetching } = useQuery(
    "solutions",
    async () => {
      const response = await fetch("/solutions.json");
      if (!response.ok) {
        throw new Error("Failed to fetch solutions");
      }

      const result = (await response.json()) as { solutions: Solution[] };
      return result.solutions.slice(0, FEATURED_SOLUTION_COUNT);
    }
  );

  return (
    <>
      <Banner searchRef={searchRef as React.RefObject<HTMLInputElement>} />
      <Strip shallow>
        <Row>
          <Col size={3}>
            <div
              className={`p-side-navigation is-sticky ${
                isNavigationOpen ? "is-drawer-expanded" : "is-drawer-collapsed"
              }`}
              id="landing-navigation"
            >
              <a
                aria-controls="landing-navigation-drawer"
                aria-expanded={isNavigationOpen}
                className="p-side-navigation__toggle"
                href="#landing-navigation"
                onClick={(event) => {
                  event.preventDefault();
                  setIsNavigationOpen(true);
                }}
              >
                Toggle side navigation
              </a>
              <a
                aria-label="Close side navigation"
                className="p-side-navigation__overlay"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setIsNavigationOpen(false);
                }}
              />
              <nav
                aria-label="Landing page sections"
                className="p-side-navigation__drawer"
                id="landing-navigation-drawer"
              >
                <div className="p-side-navigation__drawer-header">
                  <a
                    aria-controls="landing-navigation-drawer"
                    className="p-side-navigation__toggle--in-drawer"
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setIsNavigationOpen(false);
                    }}
                  >
                    Hide side navigation
                  </a>
                </div>
                <ul className="p-side-navigation__list">
                  <li className="p-side-navigation__item">
                    <a
                      aria-current={
                        activeSection === "solutions" ? "location" : undefined
                      }
                      className={`p-side-navigation__link ${
                        activeSection === "solutions" ? "is-active" : ""
                      }`}
                      href="#discover-solutions"
                      onClick={() => {
                        setActiveSection("solutions");
                        setIsNavigationOpen(false);
                      }}
                    >
                      Solutions
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      aria-current={
                        activeSection === "charms" ? "location" : undefined
                      }
                      className={`p-side-navigation__link ${
                        activeSection === "charms" ? "is-active" : ""
                      }`}
                      href="#explore-charms"
                      onClick={() => {
                        setActiveSection("charms");
                        setIsNavigationOpen(false);
                      }}
                    >
                      Charms
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </Col>
          <Col size={9}>
            <section
              aria-labelledby="discover-solutions-heading"
              className="p-section--shallow"
              id="discover-solutions"
            >
              <Row>
                <Col size={7}>
                  <h2 id="discover-solutions-heading">Discover Solutions</h2>
                  <p>
                    Solutions are curated collections of charms, integrations,
                    and additional resources designed to work together as
                    complete, deployable systems for real-world use cases.
                  </p>
                </Col>
              </Row>
              <div>
                <Row>
                  {areSolutionsFetching &&
                    [...Array(FEATURED_SOLUTION_COUNT)].map((_item, index) => (
                      <Col
                        size={9}
                        key={index}
                        style={{ marginBottom: "1.5rem" }}
                      >
                        <LoadingCard />
                      </Col>
                    ))}
                  {!areSolutionsFetching &&
                    solutionsData?.map((solution) => (
                      <Col
                        size={9}
                        key={solution.name}
                        style={{ marginBottom: "1.5rem" }}
                      >
                        {/* temporarily using CharmCard until a dedicated SolutionCard is implemented */}
                        <CharmCard
                          data={{
                            categories: solution.categories.map((category) => {
                              const name =
                                typeof category === "string"
                                  ? category
                                  : category.name || "";
                              return {
                                display_name:
                                  typeof category === "string"
                                    ? category
                                    : category.display_name || name,
                                name,
                              };
                            }),
                            package: {
                              description: solution.summary,
                              display_name: solution.title,
                              icon_url: solution.icon || undefined,
                              last_updated: solution.last_updated || undefined,
                              name: `solutions/${solution.name}`,
                              platforms: solution.platform
                                ? [
                                    solution.platform === "machine"
                                      ? "vm"
                                      : solution.platform,
                                  ]
                                : [],
                            },
                            publisher: {
                              display_name: solution.publisher,
                              name: solution.publisher,
                            },
                          }}
                        />
                      </Col>
                    ))}
                </Row>
              </div>
              <p className="u-no-padding--top">
                <a href="/?type=solutions">View all Solutions</a>
              </p>
            </section>
            <section
              aria-labelledby="explore-charms-heading"
              id="explore-charms"
            >
              <Row>
                <Col size={7}>
                  <h2 id="explore-charms-heading">Explore Charms</h2>
                  <p>
                    Charms package a workload or application with the
                    operational knowledge required to deploy, configure, scale,
                    and maintain it consistently on any cloud. You can use
                    charms with Juju, Canonical's open source orchestration
                    engine for software operators.
                  </p>
                </Col>
              </Row>
              <div>
                <Row>
                  {isFetching &&
                    [...Array(FEATURED_CHARM_COUNT)].map((_item, index) => (
                      <Col
                        size={3}
                        key={index}
                        style={{ marginBottom: "1.5rem" }}
                      >
                        <LoadingCard />
                      </Col>
                    ))}
                  {!isFetching &&
                    status === "success" &&
                    data?.packages
                      .slice(0, FEATURED_CHARM_COUNT)
                      .map((charm) => (
                        <Col
                          size={3}
                          key={charm.id}
                          style={{ marginBottom: "1.5rem" }}
                        >
                          <CharmCard data={charm} />
                        </Col>
                      ))}
                </Row>
              </div>
              <p className="u-no-padding--top">
                <a href="/?type=charm">View all Charms</a>
              </p>
            </section>
          </Col>
        </Row>
      </Strip>
    </>
  );
};
