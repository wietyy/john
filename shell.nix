{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "john-dev-shell";

  ports = [ "3000" ];

  buildInputs = with pkgs; [
    bun
    nodejs
    python3
    git
  ];
}