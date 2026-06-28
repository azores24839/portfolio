    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    function resetInitialPosition() {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    resetInitialPosition();
    window.addEventListener("pageshow", () => requestAnimationFrame(resetInitialPosition));
    window.addEventListener("load", () => requestAnimationFrame(resetInitialPosition), { once: true });

    const terminalLines = [
      ["$ whoami", [
        "SJTU Industrial Design M.A. student from Malaysia",
        "Multilingual (Chinese · English · Malay)",
        "Focus on visual design"
      ]],
      ["$ intent/", [
        "Visual Design · AI Video · Brand Creative · UIUX"
      ]],
      ["$ skills/", [
        "Visual Design · Product Design · UX Research · AI Thinking · Vibe Coding · Motion & Video"
      ]]
    ];

    const terminal = document.querySelector("#terminal");
    let lineIndex = 0;
    let charIndex = 0;
    let terminalHtml = "";

    function typeTerminal() {
      if (lineIndex >= terminalLines.length) {
        terminal.innerHTML = terminalHtml + '<span class="cursor"></span>';
        return;
      }

      const [prompt, outputLines] = terminalLines[lineIndex];
      const text = charIndex <= prompt.length ? prompt.slice(0, charIndex) : prompt;
      terminal.innerHTML = terminalHtml + '<span style="color:#4f8d67">~</span> ' + text + '<span class="cursor"></span>';

      if (charIndex <= prompt.length) {
        charIndex += 1;
        setTimeout(typeTerminal, 34);
        return;
      }

      terminalHtml += '<span style="color:#4f8d67">~</span> ' + prompt
        + '<br><span>' + outputLines.join('<br>') + '</span>'
        + '<br>'
        + (lineIndex < terminalLines.length - 1 ? '<span class="terminal-gap" aria-hidden="true"></span>' : '');
      lineIndex += 1;
      charIndex = 0;
      setTimeout(typeTerminal, 360);
    }

    setTimeout(typeTerminal, 2500);

    const stage = document.querySelector(".stage");

    function fitHeroStage() {
      if (!stage || window.matchMedia("(max-width: 920px)").matches) {
        if (stage) stage.style.removeProperty("transform");
        return;
      }
      const availableWidth = window.innerWidth - 40;
      const availableHeight = window.innerHeight - 72;
      const scale = Math.min(1, availableWidth / 1400, availableHeight / 700);
      stage.style.transform = `scale(${Math.max(.58, scale)})`;
    }

    fitHeroStage();
    window.addEventListener("resize", fitHeroStage, { passive: true });

    const pattern = [
      "000000000000000000",
      "000111101111000000",
      "001000101000100000",
      "001111101111000000",
      "001000101001000000",
      "001000101000100000",
      "000111101111000000",
      "000000000000000000",
      "000011000110000000",
      "000111101111000000",
      "001100111001100000",
      "001000000000100000",
      "000000000000000000"
    ].join("");

    const colors = ["#f24e1e", "#ff7262", "#a259ff", "#1abcfe", "#0acf83"];
    const dots = document.querySelector("#dots");
    dots && [...pattern].forEach((value, index) => {
      const dot = document.createElement("span");
      dot.className = "dot" + (value === "1" ? " on" : "");
      dot.style.setProperty("--c", colors[Math.floor(index / 18) % colors.length]);
      dot.style.setProperty("--d", `${index * 7}ms`);
      dots.appendChild(dot);
    });

    const projectData = window.PORTFOLIO_DATA || {};
    const categoryScenes = {
      game: ["#b8d3e3", "#e8d6b3", "#6f8fa4"],
      ai: ["#ead4a8", "#debb8e", "#9c7245"],
      video: ["#efc5c0", "#e09d98", "#9c5e68"],
      product: ["#d8c9ea", "#b09ad0", "#6d568d"]
    };
    const detail = document.querySelector(".finder-detail");
    const detailContent = document.querySelector("#portfolioDetailContent");
    const projectsView = document.querySelector(".projects-view");
    let videoObserver;

    function addMetadata(container, label, value) {
      if (!value) return;
      const row = document.createElement("p");
      const term = document.createElement("span");
      term.textContent = label;
      row.append(term, document.createTextNode(value));
      container.appendChild(row);
    }

    function createPlaceholder(project, category) {
      const scene = categoryScenes[category] || categoryScenes.game;
      const placeholder = document.createElement("div");
      placeholder.className = "portfolio-placeholder";
      placeholder.style.setProperty("--scene-a", scene[0]);
      placeholder.style.setProperty("--scene-b", scene[1]);
      placeholder.style.setProperty("--scene-c", scene[2]);
      const label = document.createElement("span");
      label.textContent = project.title;
      placeholder.appendChild(label);
      return placeholder;
    }

    function createMedia(project, category) {
      const gallery = document.createElement("div");
      gallery.className = "portfolio-media";
      if (!project.media.length) {
        gallery.appendChild(createPlaceholder(project, category));
        return gallery;
      }

      project.media.forEach(media => {
        const figure = document.createElement("figure");
        figure.className = "portfolio-media-item";
        if (media.type === "image") {
          const image = document.createElement("img");
          image.src = media.src;
          image.alt = media.alt;
          image.loading = "lazy";
          image.decoding = "async";
          figure.appendChild(image);
        } else if (media.type === "video") {
          const shell = document.createElement("div");
          shell.className = "portfolio-video-shell";
          const video = document.createElement("video");
          video.src = media.src;
          video.loop = true;
          video.playsInline = true;
          video.preload = "metadata";
          video.setAttribute("aria-label", project.title);
          const play = document.createElement("button");
          play.type = "button";
          play.className = "portfolio-video-play";
          play.textContent = "点击播放并开启声音";
          play.hidden = true;
          play.addEventListener("click", async () => {
            try {
              video.muted = false;
              await video.play();
              play.hidden = true;
            } catch {
              play.hidden = false;
            }
          });
          shell.append(video, play);
          figure.appendChild(shell);
        } else {
          figure.classList.add("portfolio-media-item--pdf");
          const link = document.createElement("a");
          link.className = "portfolio-pdf-card";
          link.href = media.src;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.setAttribute("aria-label", `打开 PDF：${media.name}`);

          const badge = document.createElement("span");
          badge.className = "portfolio-pdf-badge";
          badge.textContent = "PDF";
          const copy = document.createElement("span");
          copy.className = "portfolio-pdf-copy";
          const name = document.createElement("strong");
          name.textContent = media.name;
          const action = document.createElement("small");
          action.textContent = "在新标签页打开 ↗";
          copy.append(name, action);
          link.append(badge, copy);
          figure.appendChild(link);
        }
        gallery.appendChild(figure);
      });
      return gallery;
    }

    function observeVideos() {
      videoObserver?.disconnect();
      videoObserver = new IntersectionObserver(entries => {
        entries.forEach(async entry => {
          const video = entry.target;
          const play = video.nextElementSibling;
          if (!entry.isIntersecting) {
            video.pause();
            return;
          }
          try {
            video.muted = false;
            await video.play();
            play.hidden = true;
          } catch {
            play.hidden = false;
          }
        });
      }, { root: detail, threshold: .15 });
      detail.querySelectorAll("video").forEach(video => videoObserver.observe(video));
    }

    function renderCategory(category) {
      detailContent.replaceChildren();
      const projects = projectData[category] || [];
      if (!projects.length) {
        const empty = document.createElement("p");
        empty.className = "portfolio-empty";
        empty.textContent = "这个文件夹还没有项目。";
        detailContent.appendChild(empty);
        return;
      }

      projects.forEach(project => {
        const article = document.createElement("article");
        article.className = "portfolio-project";
        const title = document.createElement("h2");
        title.textContent = project.title;
        const metadata = document.createElement("div");
        metadata.className = "portfolio-metadata";
        addMetadata(metadata, "项目类型", project.type);
        addMetadata(metadata, "我的角色", project.role);
        addMetadata(metadata, "标签", project.labels);
        addMetadata(metadata, "使用工具", project.tools);
        addMetadata(metadata, "关键词", project.keywords);
        const copy = document.createElement("div");
        copy.className = "portfolio-copy";
        copy.innerHTML = project.bodyHtml;
        article.append(title, metadata, copy, createMedia(project, category));
        detailContent.appendChild(article);
      });
      observeVideos();
    }

    function setProject(projectId) {
      if (!projectData[projectId]) return;
      document.querySelectorAll(".project-folder").forEach(folder => {
        folder.classList.toggle("active", folder.dataset.project === projectId);
      });
      detail.classList.remove("is-changing");
      void detail.offsetWidth;
      detail.classList.add("is-changing");
      detail.dataset.project = projectId;
      renderCategory(projectId);
      projectsView.classList.add("detail-open");
      detail.scrollTop = 0;
    }

    document.querySelectorAll(".project-folder").forEach(folder => {
      folder.addEventListener("click", () => setProject(folder.dataset.project));
    });
    document.querySelector(".detail-close").addEventListener("click", () => {
      detail.querySelectorAll("video").forEach(video => video.pause());
      videoObserver?.disconnect();
      projectsView.classList.remove("detail-open");
      document.querySelectorAll(".project-folder").forEach(folder => folder.classList.remove("active"));
    });

    const finderTitle = document.querySelector(".finder-titlebar");
    const finderNavButtons = document.querySelectorAll(".finder-nav button[data-view]");
    const finderViews = document.querySelectorAll("[data-view-panel]");

    function setFinderView(viewId) {
      if (viewId !== "projects") {
        detail.querySelectorAll("video").forEach(video => video.pause());
      }
      finderNavButtons.forEach(button => {
        const selected = button.dataset.view === viewId;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      finderViews.forEach(view => view.classList.toggle("active", view.dataset.viewPanel === viewId));
      finderTitle.lastChild.textContent = viewId === "projects" ? " ~/sihua/project" : ` ~/sihua/${viewId}`;
    }

    finderNavButtons.forEach(button => {
      button.addEventListener("click", () => setFinderView(button.dataset.view));
    });
    setFinderView("projects");

    const campusImages = window.CAMPUS_IMAGES || [];
    const campusView = document.querySelector(".garden-view");
    const campusPhotoButton = document.querySelector(".campus-photo-button");
    const campusPhoto = document.querySelector(".campus-photo");
    const campusPrev = document.querySelector(".campus-prev");
    const campusNext = document.querySelector(".campus-next");
    const campusDots = document.querySelector(".campus-dots");
    const campusLightbox = document.querySelector(".campus-lightbox");
    const campusLightboxPhoto = campusLightbox.querySelector("img");
    let campusIndex = 0;

    function renderCampusPhoto() {
      const hasPhotos = campusImages.length > 0;
      campusPhotoButton.hidden = !hasPhotos;
      campusPrev.hidden = campusImages.length < 2;
      campusNext.hidden = campusImages.length < 2;
      campusDots.replaceChildren();
      if (!hasPhotos) return;

      campusIndex = (campusIndex + campusImages.length) % campusImages.length;
      campusPhoto.src = campusImages[campusIndex].src;
      campusPhoto.hidden = false;
      campusPhoto.style.animation = "none";
      void campusPhoto.offsetWidth;
      campusPhoto.style.removeProperty("animation");
      campusImages.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.toggle("active", index === campusIndex);
        campusDots.appendChild(dot);
      });
    }

    function stepCampusPhoto(direction) {
      campusIndex += direction;
      renderCampusPhoto();
      if (!campusLightbox.hidden) campusLightboxPhoto.src = campusImages[campusIndex].src;
    }

    campusPrev.addEventListener("click", () => stepCampusPhoto(-1));
    campusNext.addEventListener("click", () => stepCampusPhoto(1));
    campusPhotoButton.addEventListener("click", () => {
      if (!campusImages.length) return;
      campusLightboxPhoto.src = campusImages[campusIndex].src;
      campusLightbox.hidden = false;
      document.body.classList.add("resume-preview-open");
    });
    campusLightbox.addEventListener("click", event => {
      if (event.target !== campusLightbox) return;
      campusLightbox.hidden = true;
      document.body.classList.remove("resume-preview-open");
    });
    document.addEventListener("keydown", event => {
      const campusIsOpen = !campusLightbox.hidden;
      if (event.key === "Escape" && campusIsOpen) {
        campusLightbox.hidden = true;
        document.body.classList.remove("resume-preview-open");
      }
      if ((campusIsOpen || campusView.classList.contains("active")) && campusImages.length > 1) {
        if (event.key === "ArrowLeft") stepCampusPhoto(-1);
        if (event.key === "ArrowRight") stepCampusPhoto(1);
      }
    });
    renderCampusPhoto();

    const resumeFolder = document.querySelector(".resume-folder");
    const resumeSheet = document.querySelector(".resume-sheet");
    const resumeLightbox = document.querySelector(".resume-lightbox");

    function openResumePreview() {
      resumeLightbox.hidden = false;
      document.body.classList.add("resume-preview-open");
    }

    function closeResumePreview() {
      resumeLightbox.hidden = true;
      document.body.classList.remove("resume-preview-open");
      resumeFolder.focus({ preventScroll: true });
    }

    resumeSheet.addEventListener("click", event => {
      event.stopPropagation();
      openResumePreview();
    });
    resumeFolder.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openResumePreview();
      }
    });
    resumeLightbox.addEventListener("click", event => {
      if (event.target === resumeLightbox) closeResumePreview();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !resumeLightbox.hidden) closeResumePreview();
    });

    const revealItems = document.querySelectorAll(".finder-window");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.18 });
    revealItems.forEach(item => observer.observe(item));

    document.addEventListener("click", event => {
      if (event.target.closest("a, button")) return;
      const burst = document.createElement("span");
      burst.className = "burst";
      burst.style.setProperty("--x", `${event.clientX}px`);
      burst.style.setProperty("--y", `${event.clientY}px`);
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
    });

    const copyHint = document.querySelector(".copy-hint");
    const copyContacts = document.querySelectorAll("[data-copy]");

    async function copyText(value) {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
    }

    copyContacts.forEach(contact => {
      contact.addEventListener("pointerenter", () => {
        copyHint.textContent = "点击复制";
        copyHint.classList.add("visible");
      });
      contact.addEventListener("pointermove", event => {
        copyHint.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`;
      });
      contact.addEventListener("pointerleave", () => copyHint.classList.remove("visible"));
      contact.addEventListener("click", async () => {
        await copyText(contact.dataset.copy);
        copyHint.textContent = "已复制";
      });
    });

    const snapSections = [...document.querySelectorAll("main > section")];
    const physicsLayer = document.querySelector("main");
    const snapPointer = window.matchMedia("(min-width: 921px) and (hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wheelThreshold = 80;
    const wheelResetDelay = 180;
    const newGestureDelay = 180;
    const spring = {
      mass: 1,
      stiffness: 190,
      damping: 25,
      restDistance: .35,
      restSpeed: 6,
      maxVelocity: 1600
    };
    let wheelTotal = 0;
    let wheelDirection = 0;
    let wheelResetTimer = 0;
    let gestureLatched = false;
    let gestureDirection = 0;
    let gestureOriginIndex = 0;
    let reverseTotal = 0;
    let wheelQuiet = true;
    let lastWheelTime = performance.now();
    let inputVelocity = 0;
    let physicsFrame = 0;
    let physicsOffset = 0;
    let physicsVelocity = 0;
    let physicsLastTime = 0;
    let physicsTargetIndex = closestSnapIndex();
    let physicsActive = false;

    function canScrollWithin(target, deltaY) {
      let element = target instanceof Element ? target : null;
      while (element && element !== document.body) {
        const style = getComputedStyle(element);
        const scrollable = /(auto|scroll)/.test(style.overflowY)
          && element.scrollHeight > element.clientHeight + 1;
        if (scrollable) {
          const atTop = element.scrollTop <= 1;
          const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
          if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
        }
        element = element.parentElement;
      }
      return false;
    }

    function closestSnapIndex() {
      let closestIndex = 0;
      let closestDistance = Infinity;
      snapSections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    }

    function resetWheelIntent() {
      wheelTotal = 0;
      wheelDirection = 0;
      inputVelocity = 0;
    }

    function releaseGestureIfReady() {
      if (physicsActive || !wheelQuiet) return;
      gestureLatched = false;
      gestureDirection = 0;
      reverseTotal = 0;
      resetWheelIntent();
    }

    function scheduleGestureRelease() {
      wheelQuiet = false;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelQuiet = true;
        releaseGestureIfReady();
      }, wheelResetDelay);
    }

    function finishPhysicsSnap() {
      window.cancelAnimationFrame(physicsFrame);
      physicsFrame = 0;
      physicsOffset = 0;
      physicsVelocity = 0;
      physicsActive = false;
      physicsLayer.style.removeProperty("transform");
      physicsLayer.classList.remove("physics-layer-active");
      window.scrollTo(0, snapSections[physicsTargetIndex].offsetTop);
      document.documentElement.classList.remove("snap-physics-active");
      releaseGestureIfReady();
    }

    function updatePhysicsSnap(timestamp) {
      if (!physicsActive) return;
      if (!physicsLastTime) physicsLastTime = timestamp;
      const deltaTime = Math.min((timestamp - physicsLastTime) / 1000, .032);
      physicsLastTime = timestamp;

      const springForce = -spring.stiffness * physicsOffset;
      const dampingForce = -spring.damping * physicsVelocity;
      const acceleration = (springForce + dampingForce) / spring.mass;
      physicsVelocity += acceleration * deltaTime;
      physicsOffset += physicsVelocity * deltaTime;
      physicsLayer.style.transform = `translate3d(0, ${physicsOffset}px, 0)`;

      if (Math.abs(physicsOffset) < spring.restDistance && Math.abs(physicsVelocity) < spring.restSpeed) {
        finishPhysicsSnap();
        return;
      }
      physicsFrame = window.requestAnimationFrame(updatePhysicsSnap);
    }

    function startPhysicsSnap(targetIndex, velocity = 0) {
      const boundedIndex = Math.max(0, Math.min(snapSections.length - 1, targetIndex));
      if (reduceMotion.matches) {
        physicsTargetIndex = boundedIndex;
        finishPhysicsSnap();
        return;
      }

      const visualScrollY = window.scrollY - physicsOffset;
      const targetY = snapSections[boundedIndex].offsetTop;
      const inheritedVelocity = physicsActive ? physicsVelocity : 0;
      physicsTargetIndex = boundedIndex;
      physicsOffset = targetY - visualScrollY;
      physicsVelocity = Math.max(
        -spring.maxVelocity,
        Math.min(spring.maxVelocity, inheritedVelocity - velocity)
      );
      physicsLastTime = 0;
      physicsActive = true;

      document.documentElement.classList.add("snap-physics-active");
      physicsLayer.classList.add("physics-layer-active");
      physicsLayer.style.transform = `translate3d(0, ${physicsOffset}px, 0)`;
      window.scrollTo(0, targetY);
      window.cancelAnimationFrame(physicsFrame);
      physicsFrame = window.requestAnimationFrame(updatePhysicsSnap);
    }

    window.addEventListener("wheel", event => {
      if (!snapPointer.matches || reduceMotion.matches || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) return;
      if (canScrollWithin(event.target, event.deltaY)) {
        resetWheelIntent();
        return;
      }

      event.preventDefault();
      const direction = Math.sign(event.deltaY);

      const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const normalizedDelta = event.deltaY * deltaScale;
      const now = performance.now();
      const gestureGap = now - lastWheelTime;
      if (gestureLatched && gestureGap > newGestureDelay) {
        gestureLatched = false;
        gestureDirection = 0;
        reverseTotal = 0;
        resetWheelIntent();
      }
      scheduleGestureRelease();
      const elapsed = Math.max(16, Math.min(now - lastWheelTime, 80));
      const measuredVelocity = normalizedDelta / elapsed * 1000;
      inputVelocity = inputVelocity * .58 + measuredVelocity * .42;
      lastWheelTime = now;

      if (gestureLatched) {
        if (direction !== gestureDirection) {
          reverseTotal += Math.abs(normalizedDelta);
          if (reverseTotal >= wheelThreshold && physicsTargetIndex !== gestureOriginIndex) {
            const reverseVelocity = Math.max(-spring.maxVelocity, Math.min(spring.maxVelocity, inputVelocity));
            gestureDirection = direction;
            reverseTotal = 0;
            startPhysicsSnap(gestureOriginIndex, reverseVelocity);
          }
        } else {
          reverseTotal = 0;
        }
        return;
      }

      if (direction !== wheelDirection) wheelTotal = 0;
      wheelDirection = direction;
      wheelTotal += Math.min(Math.abs(normalizedDelta), wheelThreshold);
      if (wheelTotal < wheelThreshold) return;

      const currentIndex = physicsActive ? physicsTargetIndex : closestSnapIndex();
      const nextIndex = Math.max(0, Math.min(snapSections.length - 1, currentIndex + direction));
      const releaseVelocity = Math.max(-spring.maxVelocity, Math.min(spring.maxVelocity, inputVelocity));
      resetWheelIntent();
      if (nextIndex === currentIndex) return;
      gestureLatched = true;
      gestureDirection = direction;
      gestureOriginIndex = currentIndex;
      reverseTotal = 0;
      startPhysicsSnap(nextIndex, releaseVelocity);
    }, { passive: false });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        if (!snapPointer.matches || reduceMotion.matches) return;
        const target = document.querySelector(link.getAttribute("href"));
        const section = target?.matches("main > section") ? target : target?.closest("main > section");
        const targetIndex = snapSections.indexOf(section);
        if (targetIndex < 0) return;
        event.preventDefault();
        history.pushState(null, "", link.getAttribute("href"));
        startPhysicsSnap(targetIndex, 0);
      });
    });
