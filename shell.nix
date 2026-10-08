{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "john-dev-shell";

  ports = [ "3000" ];

  buildInputs = with pkgs; [
    bun
    nodejs
    python3
    git
    podman
  ];

  shellHook = ''
    export GIT_PS1_SHOWCOLORHINTS=true && export PS1='\nnixshell \w$(__git_ps1) > ' && echo "JOHN Development Environment Started"
  '';
}