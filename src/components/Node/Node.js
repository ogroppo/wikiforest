import React, { memo, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import {
  FiChevronLeft,
  FiChevronUp,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { RiGroupLine, RiParentLine } from "react-icons/ri";
import { GiBigDiamondRing } from "react-icons/gi";
import { BsImage } from "react-icons/bs";
import { MdChildCare } from "react-icons/md";
import "./Node.scss";
import {
  CHILD_ID,
  EYE_COLOR_ID,
  GENI_ID,
  HAIR_COLOR_ID,
  WIKITREE_ID,
} from "../../constants/properties";
import DetailsModal from "../../modals/DetailsModal/DetailsModal";
import { FaMale, FaFemale, FaEye } from "react-icons/fa";
import colorByProperty from "../../wikidata/colorByProperty";
import { GiPerson } from "react-icons/gi";
import { AppContext } from "../../App";
import clsx from "clsx";
import getWikitreeImageUrl from "../../wikitree/getWikitreeImageUrl";
import getGeniImage from "../../geni/getGeniImage";
import styled, { useTheme } from "styled-components";

export default memo(function Node({
  node,
  currentProp,
  toggleParents,
  toggleChildren,
  toggleSiblings,
  toggleSpouses,
  setFocusedNode,
  focusedNode,
  debug,
}) {
  if (debug) console.log(node);

  const [showModal, setShowModal] = useState(false);
  const [thumbnails, setThumbnails] = useState(node.data.thumbnails);
  const [images, setImages] = useState(node.data.images);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const theme = useTheme();

  const { settings, secondLabel } = useContext(AppContext);

  const hideModal = () => {
    setShowModal(false);
  };

  const eyeColor = useMemo(
    () => colorByProperty(node.data.simpleClaims[EYE_COLOR_ID]),
    [node.data.simpleClaims]
  );
  const hairColor = useMemo(
    () => colorByProperty(node.data.simpleClaims[HAIR_COLOR_ID]),
    [node.data.simpleClaims]
  );
  useEffect(() => {
    if (settings.showExternalImages) {
      const wikitreeId = node.data.simpleClaims[WIKITREE_ID];
      if (wikitreeId) {
        getWikitreeImageUrl(wikitreeId[0].value).then((wikitreeImage) => {
          if (wikitreeImage) {
            const img = {
              url: wikitreeImage,
              alt: `Wikitree.com image`,
            };
            setThumbnails(thumbnails.concat(img));
            setImages(images.concat(img));
          }
        });
      }

      const geniId = node.data.simpleClaims[GENI_ID];
      if (geniId) {
        getGeniImage(geniId[0].value).then((geniImage) => {
          if (geniImage) {
            const geniImg = {
              url: geniImage,
              alt: `Geni.com image`,
            };
            setThumbnails(thumbnails.concat(geniImg));
            setImages(images.concat(geniImg));
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: { gender, isHuman, faceImage },
  } = node;

  const currentThumbnail = thumbnails[thumbnailIndex];

  const onThumbClick =
    thumbnails.length > 1
      ? () => setThumbnailIndex((thumbnailIndex + 1) % thumbnails.length)
      : null;

  const hasSecondLabel =
    secondLabel &&
    node.data.secondLabel &&
    node.data.label !== node.data.secondLabel;
  return (
    <ThemedNodeOuter
      style={{
        left: node.x,
        top: node.y,
      }}
      className={clsx("Node", {
        focused: focusedNode && focusedNode.treeId === node.treeId,
        [gender]: gender,
      })}
      onClick={() => setFocusedNode(node)}
      //data-id={node.data.id}
      //data-tree-id={node.treeId}
    >
      <ThemedNodeInner>
        <ThemedThumbnail
          className={clsx("imgWrapper", {
            hasThumbnails: thumbnails.length > 1,
          })}
          onClick={onThumbClick}
        >
          {(!thumbnails || !thumbnails.length) && (
            <span className="defaultImgMessage">
              {isHuman && gender ? (
                <>
                  {gender === "male" && <FaMale />}
                  {gender === "female" && <FaFemale />}
                  {gender === "thirdgender" && <GiPerson />}
                </>
              ) : (
                <BsImage />
              )}
            </span>
          )}
          {currentThumbnail && (
            <>
              {settings.showFace && faceImage ? (
                <img
                  alt={faceImage.alt}
                  src={
                    faceImage.url +
                    (settings.imageType === "head" ? "?factor=1.5" : "")
                  }
                  title={faceImage.alt}
                />
              ) : (
                <img
                  alt={currentThumbnail.alt}
                  src={currentThumbnail.url}
                  title={currentThumbnail.alt}
                />
              )}
              {thumbnails.length > 1 && (
                <span className="thumbnailCounter">
                  {thumbnailIndex + 1}/{thumbnails.length}
                </span>
              )}
            </>
          )}
        </ThemedThumbnail>
        <ThemedContent className="content" hasSecondLabel={hasSecondLabel}>
          {settings.showEyeHairColors && (
            <div
              className="colorIcons"
              style={{
                position: "absolute",
                bottom: 0,
                right: "2px",
              }}
            >
              {eyeColor && (
                <span
                  className="eyeColor"
                  title={eyeColor.itemLabel + " eyes"}
                  style={{
                    color: "#" + eyeColor.hex,
                  }}
                >
                  <FaEye size={25} />
                </span>
              )}
              {/*{hairColor && (
              <span
                className="hairColor"
                title={hairColor.itemLabel}
                style={{
                  color: "#" + hairColor.hex,
                }}
              >
                <GiBeard />
              </span>
            )}*/}
            </div>
          )}
          <div className="four-line-clamp">
            {node.isRoot ? (
              <h1
                className="label btn btn-link mb-0"
                role="button"
                tabIndex="0"
                onClick={() => setShowModal(true)}
                title={
                  node.data.label ? `Show ${node.data.label} details` : null
                }
              >
                {node.data.birthName && settings.showBirthName ? (
                  node.data.birthName
                ) : node.data.label ? (
                  node.data.label
                ) : (
                  <i>Unlabelled</i>
                )}
              </h1>
            ) : (
              <span
                className="label btn btn-link"
                role="button"
                tabIndex="0"
                onClick={() => setShowModal(true)}
                title={
                  node.data.label ? `Show ${node.data.label} details` : null
                }
              >
                {node.data.birthName && settings.showBirthName ? (
                  node.data.birthName
                ) : node.data.label ? (
                  node.data.label
                ) : (
                  <i>Unlabelled</i>
                )}
              </span>
            )}
            {hasSecondLabel && (
              <>
                <br />
                <span className="label labelsecondLabel">
                  {node.data.secondLabel}
                </span>
              </>
            )}
            {node.data.description && (
              <>
                <br />
                <span className="description" title={node.data.description}>
                  {node.data.description}
                </span>
              </>
            )}
          </div>
          <div className="dates">
            {node.data.lifeSpan
              ? theme.datesYearOnly
                ? node.data.lifeSpanInYears
                : node.data.lifeSpan
              : node.data.startEndSpan
              ? node.data.startEndSpan
              : node.data.inceptionAblishedSpan
              ? node.data.inceptionAblishedSpan
              : ""}
          </div>
        </ThemedContent>
      </ThemedNodeInner>
      {/* {node._parentsExpanded && currentProp && (
        <div className="upPropLabel" style={{ top: -CARD_VERTICAL_GAP / 2 }}>
          <span>{currentProp.label}</span>
        </div>
      )}
      {node._childrenExpanded && currentProp && (
        <div
          className="downPropLabel"
          style={{ bottom: -CARD_VERTICAL_GAP / 2 }}
        >
          <span>{currentProp.label}</span>
        </div>
      )} */}
      {node.data.leftIds && !!node.data.leftIds.length && (
        <Button
          className={`siblingCount counter`}
          variant={"link"}
          disabled={node.loadingSiblings}
          onClick={() => toggleSiblings(node)}
          title={(node._siblingsExpanded ? "Collapse" : "Expand") + " siblings"}
        >
          <div className="value">{node.data.leftIds.length}</div>
          <div className="chevron mt-1 mb-1">
            {node._siblingsExpanded ? <FiChevronRight /> : <FiChevronLeft />}
          </div>
          <div className="icon">
            <RiGroupLine />
          </div>
        </Button>
      )}
      {node.data.rightIds && !!node.data.rightIds.length && (
        <Button
          className={`spouseCount counter`}
          variant={"link"}
          disabled={node.loadingSpouses}
          onClick={() => toggleSpouses(node)}
          title={(node._spousesExpanded ? "Collapse" : "Expand") + " spouses"}
        >
          <div className="value">{node.data.rightIds.length}</div>
          <div className="chevron mt-1 mb-1">
            {node._spousesExpanded ? <FiChevronLeft /> : <FiChevronRight />}
          </div>
          <div className="icon">
            <GiBigDiamondRing />
          </div>
        </Button>
      )}
      {node.data.upIds && !!node.data.upIds.length && (
        <Button
          className={`parentCount counter`}
          variant={"link"}
          disabled={node.loadingParents}
          onClick={() => toggleParents(node)}
        >
          <span className="value">{node.data.upIds.length}</span>
          <span className="chevron ml-1 mr-1">
            {node._parentsExpanded ? <FiChevronDown /> : <FiChevronUp />}
          </span>
          {currentProp && currentProp.id === CHILD_ID && (
            <span className="icon">
              <RiParentLine />
            </span>
          )}
        </Button>
      )}
      {node.data.downIds && !!node.data.downIds.length && (
        <Button
          className={`childrenCount counter`}
          variant={"link"}
          disabled={node.loadingChildren}
          onClick={() => toggleChildren(node)}
        >
          <span className="value">{node.data.childrenCount}</span>
          <span className="chevron ml-1 mr-1">
            {node._childrenExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </span>
          {currentProp && currentProp.id === CHILD_ID && (
            <span className="icon">
              <MdChildCare />
            </span>
          )}
        </Button>
      )}
      {node.data.downIds &&
        !node.data.downIds.length &&
        !!node.data.childrenCount &&
        node.data.childrenCount > 0 &&
        currentProp &&
        currentProp.id === CHILD_ID && (
          <Button
            className={`childrenCount counter`}
            variant={"link"}
            title={"Children not available, please add them on wikidata.org"}
          >
            <span className="value">{node.data.childrenCount}</span>
            <span className="icon">
              <MdChildCare />
            </span>
          </Button>
        )}
      {showModal && (
        <DetailsModal hideModal={hideModal} node={node} nodeImages={images} />
      )}
    </ThemedNodeOuter>
  );
});

const ThemedNodeOuter = styled.div`
  height: ${({ theme }) => theme.nodeHeight}px;
  width: ${({ theme }) => theme.nodeWidth}px;
  background-color: ${({ theme }) => theme.nodeBackgroundColor};
  display: flex;
  ${({ theme }) => theme.nodeFlexDirection === "row" && `align-items: center`};
  ${({ theme }) =>
    theme.nodeFlexDirection === "column" && `justify-content: center`};
`;

const ThemedNodeInner = styled.div`
  display: flex;
  flex-direction: ${({ theme }) => theme.nodeFlexDirection};
  ${({ theme }) =>
    theme.nodeFlexDirection === "row" && `height: ${theme.thumbHeight}px`};
  ${({ theme }) =>
    theme.nodeFlexDirection === "column" && `width: ${theme.thumbWidth}px`};
`;

const ThemedThumbnail = styled.div`
  width: ${({ theme }) => theme.thumbWidth}px;
  height: ${({ theme }) => theme.thumbHeight}px;
  ${({ theme }) =>
    theme.nodeFlexDirection === "row" &&
    `margin-left: ${(theme.nodeHeight - theme.thumbHeight) / 2}px`};
  ${({ theme }) =>
    theme.nodeFlexDirection === "column" &&
    `margin-top: ${(theme.nodeWidth - theme.thumbWidth) / 2}px`};
  .thumbnailCounter {
    display: ${({ theme }) => theme.thumbCounterDisplay};
  }
`;

const ThemedContent = styled.div`
  ${({ theme }) => theme.nodeFlexDirection === "row" && `padding-left: 4px`};
  ${({ theme }) => theme.nodeFlexDirection === "column" && `padding-top: 4px`};
  .label {
    // word-break: break-all;
    font-size: ${({ theme }) => theme.labelFontSize}px;
    //if there is no description we can have this block and have the dots of the same color of the text
    //but only ONE can be display block
    display: ${({ theme, hasSecondLabel }) =>
      theme.descriptionDisplay === "none" && !hasSecondLabel
        ? "block"
        : "inline"};
  }
  .description {
    //if "block" the dots will have the same color of the text
    display: ${({ theme }) => theme.descriptionDisplay};
  }
  .dates {
    display: ${({ theme }) => theme.datesDisplay};
    font-size: ${({ theme }) => theme.datesFontSize}px;
  }
`;
